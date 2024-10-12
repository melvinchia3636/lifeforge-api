import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import request from "request";
import { rateLimit } from "express-rate-limit";
import Pocketbase from "pocketbase";
import morganMiddleware from "./middleware/morganMiddleware.js";
import pocketbaseMiddleware from "./middleware/pocketbaseMiddleware.js";

import DESCRIPTIONS from "./constants/description.js";

import asyncWrapper from "./utils/asyncWrapper.js";
import { query } from "express-validator";
import hasError from "./utils/checkError.js";
import { flattenRoutes, getRoutes } from "./utils/getRoutes.js";
import router from "./routes.js";
import dotenv from "dotenv";
import { successWithBaseResponse } from "./utils/response.js";
import { BaseResponse } from "./interfaces/base_response.js";
import { Route } from "./interfaces/api_routes_interfaces.js";

dotenv.config({
  path: ".env.local",
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  skip: async (req) => {
    if (
      req.path.startsWith("/media/") ||
      req.path.match(/\/locales\/(\w|-){2,5}$/) ||
      [
        "/code-time/user/minutes",
        "/code-time/eventLog",
        "/user/passkey/challenge",
        "/user/passkey/login",
        "/user/auth/verify",
        "/user/auth/login",
        "/books-library/cover",
        "/status",
        "/youtube-videos/video/thumbnail",
      ].some((route) => req.path.startsWith(route))
    ) {
      return true;
    }

    const bearerToken = req.headers.authorization?.split(" ")[1];
    const pb = new Pocketbase(process.env.PB_HOST);

    if (!bearerToken) {
      return false;
    }

    try {
      pb.authStore.save(bearerToken, null);

      try {
        await pb.collection("users").authRefresh();
        return true;
      } catch (error: any) {
        if (error.response.code === 401) {
          return false;
        }
      }
    } catch {
      return false;
    }
    return false;
  },
});

const app = express();
app.disable("x-powered-by");
app.set("view engine", "ejs");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://improved-zebra-55ggwr697jvh47xr-5173.app.github.dev",
      "https://lifeforge.thecodeblog.net",
      "https://api-explorer.lifeforge.thecodeblog.net",
      "https://localization-manager.lifeforge.thecodeblog.net",
    ],
  })
);
app.use(express.raw());
app.use(express.json());
app.use(morganMiddleware);
app.use(pocketbaseMiddleware);
app.use(limiter);
app.use(express.static("static"));

const mainRouter = express.Router();

mainRouter.use("/", router);

mainRouter.get("/status", async (req: Request, res: Response) => {
  res.json({
    state: "success",
  });
});

mainRouter.get(
  "/",
  asyncWrapper(
    async (
      _: Request,
      res: Response<BaseResponse<Record<string, Route[]>>>
    ) => {
      const routes: Record<string, Route[]> = Object.fromEntries(
        Object.entries(
          flattenRoutes(getRoutes(`./src`, "routes.ts"))
            .map((route) => ({
              ...route,
              description:
                DESCRIPTIONS[
                  `${route.method} ${route.path.replace(/:(\w+)/g, "{$1}")}` as keyof typeof DESCRIPTIONS
                ],
            }))
            .reduce((acc: Record<string, Route[]>, route) => {
              const r = route.path.split("/")[1] as keyof typeof acc;
              if (acc[r]) {
                acc[r].push(route);
              } else {
                acc[r] = [route];
              }
              return acc;
            }, {})
        ).map(([key, value]) => [
          key,
          value.sort((a, b) => {
            if (a.path.split("/")[2] === b.path.split("/")[2]) {
              return (
                ["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(a.method) -
                ["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(b.method)
              );
            }
            return a.path.localeCompare(b.path);
          }),
        ])
      );

      successWithBaseResponse(res, routes);
    }
  )
);

mainRouter.get(
  "/media/:collectionId/:entriesId/:photoId",
  [query("thumb").optional().isString(), query("token").optional().isString()],
  asyncWrapper(async (req: Request, res: Response) => {
    if (hasError(req, res)) return;

    const { thumb, token } = req.query as {
      thumb?: string;
      token?: string;
    };

    const { collectionId, entriesId, photoId } = req.params;
    const searchParams = new URLSearchParams();

    if (thumb) {
      searchParams.append("thumb", thumb);
    }

    if (token) {
      searchParams.append("token", token);
    }

    request(
      `${process.env.PB_HOST}/api/files/${collectionId}/${entriesId}/${photoId}?${searchParams.toString()}`
    ).pipe(res);
  })
);

mainRouter.get("/cron", async (req: Request, res: Response) => {
  res.json({
    state: "success",
  });
});

mainRouter.use((req: Request, res: Response) => {
  res.status(404);

  res.json({
    state: "error",
    message: "Endpoint not found",
  });
});

app.use("/", mainRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
