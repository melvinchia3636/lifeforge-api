import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { IWalletAsset } from "../../../interfaces/wallet_interfaces.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all wallet assets
 * @description Retrieve a list of all wallet assets.
 * @response 200 (IWalletAsset[]) - The list of wallet assets
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletAsset[]>>) => {
      const { pb } = req;

      const assets: IWalletAsset[] = await pb
        .collection("wallet_assets")
        .getFullList();
      const transactions = await pb
        .collection("wallet_transactions")
        .getFullList();

      assets.forEach((asset) => {
        asset.balance = transactions
          .filter((transaction) => transaction.asset === asset.id)
          .reduce((acc, curr) => {
            return curr.side === "credit"
              ? acc - curr.amount
              : acc + curr.amount;
          }, asset.starting_balance);
      });

      successWithBaseResponse(res, assets);
    }
  )
);

/**
 * @protected
 * @summary Create a new wallet asset
 * @description Create a new wallet asset with the given name, icon, and starting balance.
 * @body name (string, required) - The name of the asset
 * @body icon (string, required) - The icon of the asset, can be any icon available in Iconify
 * @body starting_balance (number, required) - The starting balance of the asset
 * @response 201 (IWalletAsset) - The created wallet asset
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("icon").isString(),
    body("starting_balance").isNumeric(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletAsset>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon, starting_balance } = req.body;

      const asset: IWalletAsset = await pb.collection("wallet_assets").create({
        name,
        icon,
        starting_balance: +starting_balance,
      });

      successWithBaseResponse(res, asset, 201);
    }
  )
);

/**
 * @protected
 * @summary Update a wallet asset
 * @description Update an existing wallet asset with the given ID, setting the name, icon, and starting balance.
 * @param id (string, required, must_exist) - The ID of the wallet asset to update
 * @body name (string, required) - The name of the asset
 * @body icon (string, required) - The icon of the asset, can be any icon available in Iconify
 * @body starting_balance (number, required) - The starting balance of the asset
 * @response 200 (IWalletAsset) - The updated wallet asset
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("starting_balance").isNumeric(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletAsset>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon, starting_balance } = req.body;

      if (!(await checkExistence(req, res, "wallet_assets", id))) return;

      const asset: IWalletAsset = await pb
        .collection("wallet_assets")
        .update(id, {
          name,
          icon,
          starting_balance,
        });

      successWithBaseResponse(res, asset);
    }
  )
);

/**
 * @protected
 * @summary Delete a wallet asset
 * @description Delete an existing wallet asset with the given ID.
 * @param id (string, required, must_exist) - The ID of the wallet asset to delete
 * @response 204 - The wallet asset was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wallet_assets", id))) return;

    await pb.collection("wallet_assets").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
