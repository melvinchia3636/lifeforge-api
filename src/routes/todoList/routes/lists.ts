import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { ITodoListList } from "../../../interfaces/todo_list_interfaces.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo lists
 * @description Retrieve a list of all todo lists.
 * @response 200
 * @returns {ITodoListList[]} - An array of todo lists
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListList[]>>) =>
      list(req, res, "todo_lists")
  )
);

/**
 * @protected
 * @summary Create a new todo list
 * @description Create a new todo list with the given name, icon, and color.
 * @body name (string, required) - The name of the list
 * @body icon (string, required) - The icon of the list
 * @body color (string, required) - The color of the list, in hex format
 * @response 201
 * @returns {ITodoListList} - The created todo list
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListList>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon, color } = req.body;

      const list: ITodoListList = await pb.collection("todo_lists").create({
        name,
        icon,
        color,
      });

      successWithBaseResponse(res, list);
    }
  )
);

/**
 * @protected
 * @summary Update a todo list
 * @description Update a todo list with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the list
 * @body name (string, required) - The name of the list
 * @body icon (string, required) - The icon of the list
 * @body color (string, required) - The color of the list, in hex format
 * @response 200
 * @returns {ITodoListList} - The updated todo list
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListList>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon, color } = req.body;

      const list: ITodoListList = await pb.collection("todo_lists").update(id, {
        name,
        icon,
        color,
      });

      successWithBaseResponse(res, list);
    }
  )
);

/**
 * @protected
 * @summary Delete a todo list
 * @description Delete a todo list with the given ID.
 * @param id (string, required, must_exist) - The ID of the list
 * @response 204
 * @returns {void} - No content
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("todo_lists").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
