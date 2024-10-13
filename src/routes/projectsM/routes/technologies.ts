import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { IProjectsMTechnology } from "../../../interfaces/projects_m_interfaces.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all projects technologies
 * @description Retrieve a list of all projects technologies.
 * @response 200 (IProjectsMTechnology[]) - The list of projects technologies
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMTechnology[]>>) =>
      list(req, res, "projects_m_technologies", {
        sort: "name",
      })
  )
);

/**
 * @protected
 * @summary Create a new projects technology
 * @description Create a new projects technology with the given name and icon.
 * @body name (string, required) - The name of the technology
 * @body icon (string, required) - The icon of the technology, can be any icon available in Iconify
 * @response 201 (IProjectsMTechnology) - The created projects technology
 */
router.post(
  "/",
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMTechnology>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon } = req.body;

      const technology: IProjectsMTechnology = await pb
        .collection("projects_m_technologies")
        .create({
          name,
          icon,
        });

      successWithBaseResponse(res, technology);
    }
  )
);

/**
 * @protected
 * @summary Update a projects technology
 * @description Update a projects technology with the given name and icon.
 * @param id (string, required, must_exist) - The ID of the projects technology
 * @body name (string, required) - The name of the technology
 * @body icon (string, required) - The icon of the technology, can be any icon available in Iconify
 * @response 200 (IProjectsMTechnology) - The updated projects technology
 */
router.patch(
  "/:id",
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IProjectsMTechnology>>) => {
      const { pb } = req;
      const { id } = req.params;
      const { name, icon } = req.body;

      const technology: IProjectsMTechnology = await pb
        .collection("projects_m_technologies")
        .update(id, {
          name,
          icon,
        });

      successWithBaseResponse(res, technology);
    }
  )
);

/**
 * @protected
 * @summary Delete a projects technology
 * @description Delete a projects technology with the given ID.
 * @param id (string, required, must_exist) - The ID of the projects technology
 * @response 200 - The projects technology was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("projects_m_technologies").delete(id);

    successWithBaseResponse(res);
  })
);

export default router;
