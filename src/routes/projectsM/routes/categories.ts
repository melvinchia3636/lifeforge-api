import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { IProjectsMCategory } from "../../../interfaces/projects_m_interfaces.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all projects categories
 * @description Retrieve a list of all projects categories.
 * @response 200 (IProjectsMCategory[]) - The list of projects categories
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMCategory[]>>) =>
      list(req, res, "projects_m_categories")
  )
);

/**
 * @protected
 * @summary Create a new projects category
 * @description Create a new projects category with the given name and icon.
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @response 201 (IProjectsMCategory) - The created projects category
 */
router.post(
  "/",
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMCategory>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon } = req.body;

      const category: IProjectsMCategory = await pb
        .collection("projects_m_categories")
        .create({
          name,
          icon,
        });

      successWithBaseResponse(res, category);
    }
  )
);

/**
 * @protected
 * @summary Update a projects category
 * @description Update a projects category with the given name and icon.
 * @param id (string, required, must_exist) - The ID of the projects category
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @response 200 (IProjectsMCategory) - The updated projects category
 */
router.patch(
  "/:id",
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMCategory>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon } = req.body;

      const category: IProjectsMCategory = await pb
        .collection("projects_m_categories")
        .update(id, {
          name,
          icon,
        });

      successWithBaseResponse(res, category);
    }
  )
);

/**
 * @protected
 * @summary Delete a projects category
 * @description Delete a projects category with the given ID.
 * @param id (string, required, must_exist) - The ID of the projects category
 * @response 204 - The projects category was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("projects_m_categories").delete(id);

    successWithBaseResponse(res);
  })
);

export default router;
