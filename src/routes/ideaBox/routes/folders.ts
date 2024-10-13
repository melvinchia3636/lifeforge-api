import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { body, query } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list, validate } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { IIdeaBoxFolder } from "../../../interfaces/ideabox_interfaces.js";
import {
  checkExistence,
  validateExistence,
} from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a single idea box folder
 * @description Retrieve a single idea box folder by its ID.
 * @param id (string, required) - The ID of the idea box folder
 * @response 200
 */
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

/**
 * @protected
 * @summary Get a list of all idea box folders
 * @description Retrieve a list of all idea box folders, filtered by the container ID given in the query.
 * @query container (string, required) - The ID of the container
 * @response 200
 */
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

/**
 * @protected
 * @summary Check if an idea box folder exists
 * @description Check if an idea box folder exists by its ID.
 * @param id (string, required) - The ID of the idea box folder
 * @response 200
 */
router.get(
  "/valid/:id",
  asyncWrapper(async (req: Request, res: Response<boolean>) =>
    validate(req, res, "idea_box_folders")
  )
);

/**
 * @protected
 * @summary Create a new idea box folder
 * @description Create a new idea box folder with the given name, container, icon, and color.
 * @body name (string, required) - The name of the folder
 * @body container (string, required) - The ID of the container
 * @body icon (string, required) - The icon of the folder, can be any icon available in Iconify
 * @body color (string, required) - The color of the folder, in hex format
 * @response 201
 */
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

/**
 * @protected
 * @summary Update an idea box folder
 * @description Update an existing idea box folder with the given ID, setting the name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the idea box folder to update
 * @body name (string, required) - The name of the folder
 * @body icon (string, required) - The icon of the folder, can be any icon available in Iconify
 * @body color (string, required) - The color of the folder, in hex format
 * @response 200
 */
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

/**
 * @protected
 * @summary Delete an idea box folder
 * @description Delete an existing idea box folder with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box folder to delete
 * @response 204
 */
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
