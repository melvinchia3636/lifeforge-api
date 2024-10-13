import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list } from "../../../utils/CRUD.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all calendar categories
 * @description Retrieve a list of all calendar categories.
 * @response 200 (ICalendarCategory[]) - The list of calendar categories
 */
router.get(
  "/",
  asyncWrapper(async (req: Request, res: Response) =>
    list(req, res, "calendar_categories")
  )
);

/**
 * @protected
 * @summary Create a new calendar category
 * @description Create a new calendar category with the given name, icon, and color.
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @response 201 (ICalendarCategory) - The created calendar category
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(async (req: Request, res: Response) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const { name, icon, color } = req.body;

    const category = await pb.collection("calendar_categories").create({
      name,
      icon,
      color,
    });
    successWithBaseResponse(res, category);
  })
);

/**
 * @protected
 * @summary Update a calendar category
 * @description Update a calendar category with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the category
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @response 200 (ICalendarCategory) - The updated calendar category
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(async (req: Request, res: Response) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    if (!(await checkExistence(req, res, "calendar_categories", id))) return;

    const category = await pb.collection("calendar_categories").update(id, {
      name,
      icon,
      color,
    });

    successWithBaseResponse(res, category);
  })
);

/**
 * @protected
 * @summary Delete a calendar category
 * @description Delete a calendar category with the given ID.
 * @param id (string, required, must_exist) - The ID of the category
 * @response 200 - The calendar category was deleted successfully
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_categories", id))) return;

    await pb.collection("calendar_categories").delete(id);
    successWithBaseResponse(res);
  })
);

export default router;
