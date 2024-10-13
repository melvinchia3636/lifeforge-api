import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import {
  clientError,
  successWithBaseResponse,
} from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { IWalletLedger } from "../../../interfaces/wallet_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all wallet ledgers
 * @description Retrieve a list of all wallet ledgers.
 * @response 200
 */
router.get(
  "/",
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletLedger[]>>) =>
      list(req, res, "wallet_ledgers")
  )
);

/**
 * @protected
 * @summary Create a new wallet ledger
 * @description Create a new wallet ledger with the given name, icon, and color.
 * @body name (string, required) - The name of the ledger
 * @body icon (string, required) - The icon of the ledger, can be any icon available in Iconify
 * @body color (string, required) - The color of the ledger, in hex format
 * @response 201 (IWalletLedger) - The created wallet ledger
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletLedger>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon, color } = req.body;

      const ledger: IWalletLedger = await pb
        .collection("wallet_ledgers")
        .create({
          name,
          icon,
          color,
        });

      successWithBaseResponse(res, ledger, 201);
    }
  )
);

/**
 * @protected
 * @summary Update a wallet ledger
 * @description Update a wallet ledger with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the ledger
 * @body name (string, required) - The name of the ledger
 * @body icon (string, required) - The icon of the ledger, can be any icon available in Iconify
 * @body color (string, required) - The color of the ledger, in hex format
 * @response 200 (IWalletLedger) - The updated wallet ledger
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(
    async (req: Request, res: Response<BaseResponse<IWalletLedger>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon, color } = req.body;

      if (!(await checkExistence(req, res, "wallet_ledgers", id))) return;

      const ledger: IWalletLedger = await pb
        .collection("wallet_ledgers")
        .update(id, {
          name,
          icon,
          color,
        });

      successWithBaseResponse(res, ledger);
    }
  )
);

/**
 * @protected
 * @summary Delete a wallet ledger
 * @description Delete a wallet ledger with the given ID.
 * @param id (string, required, must_exist) - The ID of the ledger
 * @response 204 - The wallet ledger was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req: Request, res: Response) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wallet_ledgers", id))) return;

    await pb.collection("wallet_ledgers").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
