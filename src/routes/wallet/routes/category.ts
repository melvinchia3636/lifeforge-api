import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { IWalletCategory } from "../../../interfaces/wallet_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all wallet categories
 * @description Retrieve a list of all wallet categories.
 * @response 200 (IWalletCategory[]) - The list of wallet categories
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletCategory[]>>) =>
      list(req, res, "wallet_categories")
  )
);

/**
 * @protected
 * @summary Create a new wallet category
 * @description Create a new wallet category with the given name, icon, color, and type.
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @body type (string, required, one_of expenses|income) - The type of the category
 * @response 201 (IWalletCategory) - The created wallet category
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
    body("type").isIn(["expenses", "income"]),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletCategory>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon, color, type } = req.body;

      const category: IWalletCategory = await pb
        .collection("wallet_categories")
        .create({
          name,
          icon,
          color,
          type,
        });

      successWithBaseResponse(res, category, 201);
    }
  )
);

/**
 * @protected
 * @summary Update a wallet category
 * @description Update a wallet category with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the wallet category
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @response 200 (IWalletCategory) - The updated wallet category
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletCategory>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon, color } = req.body;

      const found = await checkExistence(req, res, "wallet_categories", id);
      if (!found) return;

      const category: IWalletCategory = await pb
        .collection("wallet_categories")
        .update(id, {
          name,
          icon,
          color,
        });

      successWithBaseResponse(res, category);
    }
  )
);

/**
 * @protected
 * @summary Delete a wallet category
 * @description Delete a wallet category with the given ID.
 * @param id (string, required, must_exist) - The ID of the wallet category
 * @response 204 - The wallet category was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    const found = await checkExistence(req, res, "wallet_categories", id);
    if (!found) return;

    await pb.collection("wallet_categories").delete(id);

    successWithBaseResponse(res, null, 204);
  })
);

export default router;
