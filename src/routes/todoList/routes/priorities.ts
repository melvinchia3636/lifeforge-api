import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { ITodoPriority } from "../../../interfaces/todo_list_interfaces.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo priorities
 * @description Retrieve a list of all todo priorities.
 * @response 200 (ITodoPriority[]) - The list of todo priorities
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoPriority[]>>) =>
      list(req, res, "todo_priorities")
  )
);

/**
 * @protected
 * @summary Create a new todo priority
 * @description Create a new todo priority with the given name and color.
 * @body name (string, required) - The name of the priority
 * @body color (string, required) - The color of the priority, in hex format
 * @response 201 (ITodoPriority) - The created todo priority
 */
router.post(
  "/",
  [body("name").exists().notEmpty(), body("color").exists().isHexColor()],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoPriority>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, color } = req.body;

      const priority: ITodoPriority = await pb
        .collection("todo_priorities")
        .create({
          name,
          color,
        });

      successWithBaseResponse(res, priority);
    }
  )
);

/**
 * @protected
 * @summary Update a todo priority
 * @description Update a todo priority with the given ID with the given name and color.
 * @param id (string, required, must_exist) - The ID of the todo priority
 * @body name (string, required) - The name of the priority
 * @body color (string, required) - The color of the priority, in hex format
 * @response 200 (ITodoPriority) - The updated todo priority
 */
router.patch(
  "/:id",
  [body("name").exists().notEmpty(), body("color").exists().isHexColor()],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoPriority>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, color } = req.body;

      const priority: ITodoPriority = await pb
        .collection("todo_priorities")
        .update(id, {
          name,
          color,
        });

      successWithBaseResponse(res, priority);
    }
  )
);

/**
 * @protected
 * @summary Delete a todo priority
 * @description Delete a todo priority with the given ID.
 * @param id (string, required, must_exist) - The ID of the todo priority
 * @response 204 - The todo priority was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("todo_priorities").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
