import express, { Request, Response } from 'express'
import asyncWrapper from '../../../../../utils/asyncWrapper.js'
import { successWithBaseResponse } from '../../../../../utils/response.js'
import { BaseResponse } from '../../../../../interfaces/base_response.js'
import { body } from 'express-validator'
import hasError from '../../../../../utils/checkError.js'
import { IProjectsMKanbanEntry } from '../../../../../interfaces/projects_m_interfaces.js'

const router = express.Router()

router.post(
    '/:columnId',
    [body('title').isString()],
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMKanbanEntry>>
        ) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { title } = req.body
            const { columnId } = req.params

            const entry: IProjectsMKanbanEntry = await pb
                .collection('projects_m_kanban_entries')
                .create({
                    column: columnId,
                    title
                })

            successWithBaseResponse(res, entry)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMKanbanEntry>>
        ) => {
            const { pb } = req
            const { id } = req.params
            const { title } = req.body

            const column: IProjectsMKanbanEntry = await pb
                .collection('projects_m_kanban_entries')
                .update(id, {
                    title
                })

            successWithBaseResponse(res, column)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('projects_m_kanban_entries').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
