import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { IProjectsMVisibility } from "../../../interfaces/projects_m_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all projects visibilities
 * @description Retrieve a list of all projects visibilities.
 * @response 200 (IProjectsMVisibility[]) - The list of projects visibilities
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMVisibility[]>>) =>
      list(req, res, "projects_m_visibilities")
  )
);

/**
 * @protected
 * @summary Create a new projects visibility
 * @description Create a new projects visibility with the given name and icon.
 * @body name (string, required) - The name of the visibility
 * @body icon (string, required) - The icon of the visibility, can be any icon available in Iconify
 * @response 201 (IProjectsMVisibility) - The created projects visibility
 */
router.post(
  "/",
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMVisibility>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon } = req.body;

      const visibility: IProjectsMVisibility = await pb
        .collection("projects_m_visibilities")
        .create({
          name,
          icon,
        });

      successWithBaseResponse(res, visibility);
    }
  )
);

/**
 * @protected
 * @summary Update a projects visibility
 * @description Update a projects visibility with the given name and icon.
 * @param id (string, required, must_exist) - The ID of the projects visibility
 * @body name (string, required) - The name of the visibility
 * @body icon (string, required) - The icon of the visibility, can be any icon available in Iconify
 * @response 200 (IProjectsMVisibility) - The updated projects visibility
 */
router.patch(
  "/:id",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMVisibility>>) => {
      const { pb } = req;
      const { id } = req.params;
      const { name, icon } = req.body;

      const visibility: IProjectsMVisibility = await pb
        .collection("projects_m_visibilities")
        .update(id, {
          name,
          icon,
        });

      successWithBaseResponse(res, visibility);
    }
  )
);

/**
 * @protected
 * @summary Delete a projects visibility
 * @description Delete a projects visibility with the given ID.
 * @param id (string, required, must_exist) - The ID of the projects visibility
 * @response 200 - The projects visibility was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("projects_m_visibilities").delete(id);

    successWithBaseResponse(res);
  })
);

export default router;
