import express, { Request, Response } from 'express'
import { successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { ITodoListList } from '../../../interfaces/todo_list_interfaces.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListList[]>>) =>
            list(req, res, 'todo_lists')
    )
)

router.post(
    '/',
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListList>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, icon, color } = req.body

            const list: ITodoListList = await pb
                .collection('todo_lists')
                .create({
                    name,
                    icon,
                    color
                })

            successWithBaseResponse(res, list)
        }
    )
)

router.patch(
    '/:id',
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListList>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name, icon, color } = req.body

            const list: ITodoListList = await pb
                .collection('todo_lists')
                .update(id, {
                    name,
                    icon,
                    color
                })

            successWithBaseResponse(res, list)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('todo_lists').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
