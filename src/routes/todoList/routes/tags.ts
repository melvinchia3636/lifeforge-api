import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { ITodoListTag } from "../../../interfaces/todo_list_interfaces.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo tags
 * @description Retrieve a list of all todo tags.
 * @response 200
 * @returns {ITodoListTag[]} - An array of todo tags
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListTag[]>>) =>
      list(req, res, "todo_tags")
  )
);

/**
 * @protected
 * @summary Create a new todo tag
 * @description Create a new todo tag with the given name.
 * @body name (string, required) - The name of the tag
 * @response 201
 * @returns {ITodoListTag} - The created todo tag
 */
router.post(
  "/",
  body("name").exists().notEmpty(),
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListTag>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name } = req.body;

      const tag: ITodoListTag = await pb.collection("todo_tags").create({
        name,
      });

      successWithBaseResponse(res, tag);
    }
  )
);

/**
 * @protected
 * @summary Update a todo tag
 * @description Update a todo tag with the given name.
 * @param id (string, required, must_exist) - The ID of the tag
 * @body name (string, required) - The name of the tag
 * @response 200
 * @returns {ITodoListTag} - The updated todo tag
 */
router.patch(
  "/:id",
  body("name").exists().notEmpty(),
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<ITodoListTag>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name } = req.body;

      const tag: ITodoListTag = await pb.collection("todo_tags").update(id, {
        name,
      });

      successWithBaseResponse(res, tag);
    }
  )
);

/**
 * @protected
 * @summary Delete a todo tag
 * @description Delete a todo tag with the given ID.
 * @param id (string, required, must_exist) - The ID of the tag
 * @response 204
 * @returns {void} - No content
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("todo_tags").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
