import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body } from "express-validator";
import { list, validate } from "../../../utils/CRUD.js";
import { IIdeaBoxContainer } from "../../../interfaces/ideabox_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";
import hasError from "../../../utils/checkError.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a single idea box container
 * @description Retrieve a single idea box container by its ID.
 * @param id (string, required) - The ID of the idea box container
 * @response 200
 */
router.get(
  "/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxContainer>>) => {
      const { pb } = req;
      const { id } = req.params;

      if (!(await checkExistence(req, res, "idea_box_containers", id))) return;

      const container: IIdeaBoxContainer = await pb
        .collection("idea_box_containers")
        .getOne(id);

      successWithBaseResponse(res, container);
    }
  )
);

/**
 * @protected
 * @summary Check if an idea box container exists
 * @description Check if an idea box container exists by its ID.
 * @param id (string, required) - The ID of the idea box container
 * @response 200
 */
router.get(
  "/valid/:id",
  asyncWrapper(async (req: Request, res: Response<boolean>) =>
    validate(req, res, "idea_box_containers")
  )
);

/**
 * @protected
 * @summary Get a list of all idea box containers
 * @description Retrieve a list of all idea box containers.
 * @response 200
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxContainer[]>>) =>
      list(req, res, "idea_box_containers")
  )
);

/**
 * @protected
 * @summary Create a new idea box container
 * @description Create a new idea box container with the given name, color, and icon.
 * @body name (string, required) - The name of the container
 * @body color (string, required) - The color of the container
 * @body icon (string) - The icon of the container
 * @response 201
 */
router.post(
  "/",
  [
    body("name").isString().notEmpty(),
    body("color").notEmpty().isHexColor(),
    body("icon").isString(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxContainer>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, color, icon } = req.body;

      const container: IIdeaBoxContainer = await pb
        .collection("idea_box_containers")
        .create({
          name,
          color,
          icon,
        });

      successWithBaseResponse(res, container, 201);
    }
  )
);

/**
 * @protected
 * @summary Update an idea box container
 * @description Update an idea box container with the given name, color, and icon.
 * @param id (string, required) - The ID of the idea box container
 * @body name (string, required) - The name of the container
 * @body color (string, required) - The color of the container
 * @body icon (string) - The icon of the container
 * @response 200
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("color").notEmpty().isHexColor(),
    body("icon").isString(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IIdeaBoxContainer>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;

      const { name, color, icon } = req.body;

      if (!(await checkExistence(req, res, "idea_box_containers", id))) return;

      const container: IIdeaBoxContainer = await pb
        .collection("idea_box_containers")
        .update(id, {
          name,
          color,
          icon,
        });

      successWithBaseResponse(res, container);
    }
  )
);

/**
 * @protected
 * @summary Delete an idea box container
 * @description Delete an idea box container by its ID.
 * @param id (string, required) - The ID of the idea box container
 * @response 204
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_containers", id))) return;

    await pb.collection("idea_box_containers").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
