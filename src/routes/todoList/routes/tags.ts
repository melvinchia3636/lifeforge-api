import express, { Request, Response } from 'express'
import { successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { ITodoListTag } from '../../../interfaces/todo_list_interfaces.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListTag[]>>) =>
            list(req, res, 'todo_tags')
    )
)

router.post(
    '/',
    body('name').exists().notEmpty(),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListTag>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name } = req.body

            const tag: ITodoListTag = await pb.collection('todo_tags').create({
                name
            })

            successWithBaseResponse(res, tag)
        }
    )
)

router.patch(
    '/:id',
    body('name').exists().notEmpty(),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<ITodoListTag>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name } = req.body

            const tag: ITodoListTag = await pb
                .collection('todo_tags')
                .update(id, {
                    name
                })

            successWithBaseResponse(res, tag)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('todo_tags').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
