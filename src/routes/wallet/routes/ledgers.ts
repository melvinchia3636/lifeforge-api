import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { IWalletLedger } from '../../../interfaces/wallet_interfaces.js'
import { BaseResponse } from '../../../interfaces/base_response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IWalletLedger[]>>) =>
            list(req, res, 'wallet_ledgers')
    )
)

router.post(
    '/',
    [
        body('name').isString(),
        body('icon').isString(),
        body('color').isHexColor()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IWalletLedger>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, icon, color } = req.body

            const ledger: IWalletLedger = await pb
                .collection('wallet_ledgers')
                .create({
                    name,
                    icon,
                    color
                })

            successWithBaseResponse(res, ledger)
        }
    )
)

router.patch(
    '/:id',
    [
        body('name').isString(),
        body('icon').isString(),
        body('color').isHexColor()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IWalletLedger>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name, icon, color } = req.body

            const ledger: IWalletLedger = await pb
                .collection('wallet_ledgers')
                .update(id, {
                    name,
                    icon,
                    color
                })

            successWithBaseResponse(res, ledger)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('wallet_ledgers').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
