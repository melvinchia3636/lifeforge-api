import express, { Request, Response } from "express";
import asyncWrapper from "../../../../../utils/asyncWrapper.js";
import {
  clientError,
  successWithBaseResponse,
} from "../../../../../utils/response.js";
import {
  IProjectsMKanbanColumn,
  IProjectsMKanbanEntry,
} from "../../../../../interfaces/projects_m_interfaces.js";
import { BaseResponse } from "../../../../../interfaces/base_response.js";
import hasError from "../../../../../utils/checkError.js";
import { body } from "express-validator";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all projects kanban columns
 * @description Retrieve a list of all projects kanban columns.
 * @param projectId (string, required, must_exist) - The ID of the project
 * @response 200 (IProjectsMKanbanColumn[]) - The list of projects kanban columns
 */
router.get(
  "/:projectId",
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IProjectsMKanbanColumn[]>>
    ) => {
      const { pb } = req;
      const { projectId } = req.params;

      const columns: (IProjectsMKanbanColumn & {
        expand?: {
          projects_m_kanban_entries_via_column: IProjectsMKanbanEntry[];
        };
      })[] = await pb.collection("projects_m_kanban_columns").getFullList({
        filter: `project="${projectId}"`,
        expand: "projects_m_kanban_entries_via_column",
      });

      columns.forEach((column) => {
        if (column.expand) {
          column.entries = column.expand.projects_m_kanban_entries_via_column;
          delete column.expand;
        }
      });

      successWithBaseResponse(res, columns as IProjectsMKanbanColumn[]);
    }
  )
);

/**
 * @protected
 * @summary Create a new projects kanban column
 * @description Create a new projects kanban column with the given name, icon, and color.
 * @param projectId (string, required, must_exist) - The ID of the project
 * @body name (string, required) - The name of the column
 * @body icon (string, required) - The icon of the column, can be any icon available in Iconify
 * @body color (string, required) - The color of the column
 * @response 201 (IProjectsMKanbanColumn) - The created projects kanban column
 */
router.post(
  "/:projectId",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IProjectsMKanbanColumn>>
    ) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon, color } = req.body;
      const { projectId } = req.params;

      const column: IProjectsMKanbanColumn = await pb
        .collection("projects_m_kanban_columns")
        .create({
          name,
          icon,
          color,
          project: projectId,
        });

      successWithBaseResponse(res, column);
    }
  )
);

/**
 * @protected
 * @summary Update a projects kanban column
 * @description Update a projects kanban column with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the projects kanban column
 * @body name (string, required) - The name of the column
 * @body icon (string, required) - The icon of the column, can be any icon available in Iconify
 * @body color (string, required) - The color of the column
 * @response 200 (IProjectsMKanbanColumn) - The updated projects kanban column
 */
router.patch(
  "/:id",
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IProjectsMKanbanColumn>>
    ) => {
      const { pb } = req;
      const { id } = req.params;
      const { name, icon, color } = req.body;

      const column: IProjectsMKanbanColumn = await pb
        .collection("projects_m_kanban_columns")
        .update(id, {
          name,
          icon,
          color,
        });

      successWithBaseResponse(res, column);
    }
  )
);

/**
 * @protected
 * @summary Delete a projects kanban column
 * @description Delete a projects kanban column with the given ID.
 * @param id (string, required, must_exist) - The ID of the projects kanban column
 * @response 200 - The projects kanban column was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("projects_m_kanban_columns").delete(id);

    successWithBaseResponse(res);
  })
);

export default router;
