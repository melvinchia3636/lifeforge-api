import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { successWithBaseResponse } from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'
import { IWalletCategory } from '../../../interfaces/wallet_interfaces.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IWalletCategory[]>>) =>
            list(req, res, 'wallet_categories')
    )
)

router.post(
    '/',
    [
        body('name').isString(),
        body('icon').isString(),
        body('color').isHexColor(),
        body('type').isString()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IWalletCategory>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, icon, color, type } = req.body

            const category: IWalletCategory = await pb
                .collection('wallet_categories')
                .create({
                    name,
                    icon,
                    color,
                    type
                })

            successWithBaseResponse(res, category)
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
        async (req: Request, res: Response<BaseResponse<IWalletCategory>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name, icon, color } = req.body

            const category: IWalletCategory = await pb
                .collection('wallet_categories')
                .update(id, {
                    name,
                    icon,
                    color
                })

            successWithBaseResponse(res, category)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('wallet_categories').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
