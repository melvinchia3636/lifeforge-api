import express, { Request, Response } from "express";
import multer from "multer";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body, query } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list } from "../../../utils/CRUD.js";
import { IIdeaBoxEntry } from "../../../interfaces/ideabox_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces.js";
import {
  checkExistence,
  validateExistence,
} from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all idea box entries
 * @description Retrieve a list of all idea box entries, filtered by container and folder given in the URL.
 * @query container (string, required, must_exist) - The container of the idea box entries
 * @query folder (string, optional, must_exist) - The folder of the idea box entries
 * @query archived (boolean, optional) - Whether to include archived entries
 * @response 200
 */
router.get(
  "/",
  [
    query("container").custom(
      async (value: string, meta) =>
        await validateExistence(meta.req.pb, "idea_box_containers", value)
    ),
    query("folder").custom(
      async (value: string, meta) =>
        await validateExistence(meta.req.pb, "idea_box_folders", value, true)
    ),
    query("archived").isBoolean().optional(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry[]>>) =>
      await list(req, res, "idea_box_entries", {
        filter: `container = "${req.query.container}" && archived = ${req.query.archived || "false"} ${
          req.query.folder
            ? `&& folder = "${req.query.folder}"`
            : "&& folder=''"
        }`,
        sort: "-pinned,-created",
      })
  )
);

/**
 * @protected
 * @summary Create a new idea box entry
 * @description Create a new idea box entry with the given container, title, content, and type.
 * @body container (string, required, must_exist) - The container of the idea box entry
 * @body type (string, required, one_of text|link|image) - The type of the idea box entry
 * @body title (string, required if type is text or link) - The title of the idea box entry
 * @body content (string, required if type is text or link) - The content of the idea box entry
 * @body imageLink (string, optional) - The link to the image, will raise an error if type is not image
 * @body folder (string, optional, must_exist) - The folder of the idea box entry
 * @body file (file, required if type is image) - The image file
 * @response 201
 */
router.post(
  "/",
  multer().single("image"),
  [
    body("container").custom(
      async (value, meta) =>
        await validateExistence(meta.req.pb, "idea_box_containers", value)
    ),
    body("title").custom((value, { req }) => {
      if (req.body.type === "image") return true;
      if (typeof value !== "string" || !value) {
        throw new Error("Invalid value");
      }
      return true;
    }),
    body("content").custom((value, { req }) => {
      if (req.body.type === "image") return true;
      if (typeof value !== "string" || !value) {
        throw new Error("Invalid value");
      }
      return true;
    }),
    body("type").isString().isIn(["text", "link", "image"]).notEmpty(),
    body("imageLink").custom((value, { req }) => {
      if (req.body.type !== "image" && value) {
        throw new Error("Invalid value");
      }
      return true;
    }),
    body("folder").isString().optional(),
    body("file").custom((_, { req }) => {
      if (req.body.type === "image" && !req.file && !req.body.imageLink) {
        throw new Error("Image is required");
      }
      return true;
    }),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { container, title, content, type, imageLink, folder } = req.body;

      const { file } = req;

      let data: WithoutPBDefault<
        Omit<IIdeaBoxEntry, "image" | "pinned" | "archived">
      > & {
        image?: File;
      } = {
        type,
        container,
        folder,
      };

      switch (type) {
        case "text":
        case "link":
          data["title"] = title;
          data["content"] = content;
          break;
        case "image":
          if (imageLink) {
            await fetch(imageLink).then(async (response) => {
              const buffer = await response.arrayBuffer();
              data["image"] = new File([buffer], "image.jpg", {
                type: "image/jpeg",
              });
              data["title"] = title;
            });
          } else {
            if (!file) {
              clientError(res, "image: Invalid value");
              return;
            }

            data["image"] = new File([file.buffer], file.originalname, {
              type: file.mimetype,
            });
            data["title"] = title;
          }
          break;
      }

      const idea: IIdeaBoxEntry = await pb
        .collection("idea_box_entries")
        .create(data);

      await pb.collection("idea_box_containers").update(container, {
        [`${type}_count+`]: 1,
      });

      successWithBaseResponse(res, idea, 201);
    }
  )
);

/**
 * @protected
 * @summary Update an idea box entry
 * @description Update an existing idea box entry with the given ID, setting the title, content, and type.
 * @param id (string, required, must_exist) - The ID of the idea box entry to update
 * @body title (string, required) - The title of the idea box entry
 * @body content (string, required) - The content of the idea box entry
 * @body type (string, required, one_of text|link) - The type of the idea box entry
 * @response 200
 */
router.patch(
  "/:id",
  [
    body("title").isString(),
    body("content").isString(),
    body("type").isIn(["text", "link"]),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { title, content, type } = req.body;

      if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

      const oldEntry = await pb.collection("idea_box_entries").getOne(id);

      let data;
      switch (type) {
        case "text":
        case "link":
          data = {
            title,
            content,
            type,
          };
          break;
      }

      const entry: IIdeaBoxEntry = await pb
        .collection("idea_box_entries")
        .update(id, data);

      if (oldEntry.type !== entry.type) {
        await pb.collection("idea_box_containers").update(entry.container, {
          [`${oldEntry.type}_count-`]: 1,
          [`${entry.type}_count+`]: 1,
        });
      }

      successWithBaseResponse(res, entry);
    }
  )
);

/**
 * @protected
 * @summary Delete an idea box entry
 * @description Delete an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to delete
 * @response 204
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

    const idea = await pb.collection("idea_box_entries").getOne(id);
    await pb.collection("idea_box_entries").delete(id);
    await pb.collection("idea_box_containers").update(idea.container, {
      [`${idea.type}_count-`]: 1,
    });

    successWithBaseResponse(res, undefined, 204);
  })
);

/**
 * @protected
 * @summary Pin/unpin an idea box entry
 * @description Update the pinned status of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to pin
 * @response 200
 */
router.post(
  "/pin/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
      const { pb } = req;
      const { id } = req.params;

      if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

      const idea = await pb.collection("idea_box_entries").getOne(id);
      const entry: IIdeaBoxEntry = await pb
        .collection("idea_box_entries")
        .update(id, {
          pinned: !idea.pinned,
        });

      successWithBaseResponse(res, entry);
    }
  )
);

/**
 * @protected
 * @summary Archive/unarchive an idea box entry
 * @description Update the archived status of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to archive
 * @response 200
 */
router.post(
  "/archive/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
      const { pb } = req;
      const { id } = req.params;

      if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

      const idea = await pb.collection("idea_box_entries").getOne(id);
      const entry: IIdeaBoxEntry = await pb
        .collection("idea_box_entries")
        .update(id, {
          archived: !idea.archived,
          pinned: false,
        });

      successWithBaseResponse(res, entry);
    }
  )
);

/**
 * @protected
 * @summary Move an idea box entry to a folder
 * @description Update the folder of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to move
 * @query folder (string, required, must_exist) - The folder to move the idea box entry to
 * @response 200
 */
router.post(
  "/folder/:id",
  query("folder").custom(
    async (value, meta) =>
      await validateExistence(meta.req.pb, "idea_box_folders", value)
  ),
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { folder } = req.query;

      if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

      const entry: IIdeaBoxEntry = await pb
        .collection("idea_box_entries")
        .update(id, {
          folder,
        });

      successWithBaseResponse(res, entry);
    }
  )
);

/**
 * @protected
 * @summary Remove an idea box entry from a folder
 * @description Update the folder of an existing idea box entry with the given ID to an empty string.
 * @param id (string, required, must_exist) - The ID of the idea box entry to remove from the folder
 * @response 200
 */
router.delete(
  "/folder/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
      const { pb } = req;
      const { id } = req.params;

      if (!(await checkExistence(req, res, "idea_box_entries", id))) return;

      const entry: IIdeaBoxEntry = await pb
        .collection("idea_box_entries")
        .update(id, {
          folder: "",
        });

      successWithBaseResponse(res, entry);
    }
  )
);

export default router;
