import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { IProjectsMStatus } from "../../../interfaces/projects_m_interfaces.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all projects statuses
 * @description Retrieve a list of all projects statuses.
 * @response 200 (IProjectsMStatus[]) - The list of projects statuses
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMStatus[]>>) =>
      list(req, res, "projects_m_statuses")
  )
);

/**
 * @protected
 * @summary Create a new projects status
 * @description Create a new projects status with the given name, icon, and color.
 * @body name (string, required) - The name of the status
 * @body icon (string, required) - The icon of the status, can be any icon available in Iconify
 * @body color (string, required) - The color of the status, in hex format
 * @response 201 (IProjectsMStatus) - The created projects status
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMStatus>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon, color } = req.body;

      const status: IProjectsMStatus = await pb
        .collection("projects_m_statuses")
        .create({
          name,
          icon,
          color,
        });

      successWithBaseResponse(res, status);
    }
  )
);

/**
 * @protected
 * @summary Update a projects status
 * @description Update a projects status with the given name, icon, and color.
 * @body name (string, required) - The name of the status
 * @body icon (string, required) - The icon of the status, can be any icon available in Iconify
 * @body color (string, required) - The color of the status, in hex format
 * @response 200 (IProjectsMStatus) - The updated projects status
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMStatus>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon, color } = req.body;

      if (!(await checkExistence(req, res, "projects_m_statuses", id))) return;

      const status: IProjectsMStatus = await pb
        .collection("projects_m_statuses")
        .update(id, {
          name,
          icon,
          color,
        });

      successWithBaseResponse(res, status);
    }
  )
);

/**
 * @protected
 * @summary Delete a projects status
 * @description Delete a projects status with the given ID.
 * @param id (string, required, must_exist) - The ID of the projects status
 * @response 204 - The projects status was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "projects_m_statuses", id))) return;

    await pb.collection("projects_m_statuses").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
