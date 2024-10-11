import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { IWalletAsset } from "../../../interfaces/wallet_interfaces.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

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
