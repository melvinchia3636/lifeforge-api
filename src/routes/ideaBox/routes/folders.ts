import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import { body, query } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list, validate } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import {
  IIdeaBoxEntry,
  IIdeaBoxFolder,
} from "../../../interfaces/ideabox_interfaces.js";
import {
  checkExistence,
  validateExistence,
} from "../../../utils/PBRecordValidator.js";

const router = express.Router();

router.get(
  "/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
      const { pb } = req;
      const { id } = req.params;

      if (!(await checkExistence(req, res, "idea_box_folders", id))) return;

      const folder: IIdeaBoxFolder = await pb
        .collection("idea_box_folders")
        .getOne(id);

      successWithBaseResponse(res, folder);
    }
  )
);

router.get(
  "/",
  [
    query("container").custom(
      async (value: string, meta) =>
        await validateExistence(meta.req.pb, "idea_box_containers", value)
    ),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder[]>>) =>
      list(req, res, "idea_box_folders", {
        filter: `container = "${req.query.container}"`,
        sort: "name",
      })
  )
);

router.get(
  "/valid/:id",
  asyncWrapper(async (req: Request, res: Response<boolean>) =>
    validate(req, res, "idea_box_folders")
  )
);

router.post(
  "/",
  [
    body("name").isString(),
    body("container").custom(
      async (value: string, meta) =>
        await validateExistence(meta.req.pb, "idea_box_containers", value)
    ),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, container, icon, color } = req.body;

      const folder: IIdeaBoxFolder = await pb
        .collection("idea_box_folders")
        .create({
          name,
          container,
          icon,
          color,
        });

      successWithBaseResponse(res, folder, 201);
    }
  )
);

router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon, color } = req.body;

      if (!(await checkExistence(req, res, "idea_box_folders", id))) return;

      const folder: IIdeaBoxFolder = await pb
        .collection("idea_box_folders")
        .update(id, {
          name,
          icon,
          color,
        });

      successWithBaseResponse(res, folder);
    }
  )
);

router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_folders", id))) return;

    await pb.collection("idea_box_folders").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
