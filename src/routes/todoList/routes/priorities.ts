import express, { Request, Response } from 'express'
import { successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { ITodoPriority } from '../../../interfaces/todo_list_interfaces.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoPriority[]>>) =>
            list(req, res, 'todo_priorities')
    )
)

router.post(
    '/',
    [body('name').exists().notEmpty(), body('color').exists().isHexColor()],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoPriority>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, color } = req.body

            const priority: ITodoPriority = await pb
                .collection('todo_priorities')
                .create({
                    name,
                    color
                })

            successWithBaseResponse(res, priority)
        }
    )
)

router.patch(
    '/:id',
    [body('name').exists().notEmpty(), body('color').exists().isHexColor()],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoPriority>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name, color } = req.body

            const priority: ITodoPriority = await pb
                .collection('todo_priorities')
                .update(id, {
                    name,
                    color
                })

            successWithBaseResponse(res, priority)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('todo_priorities').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
