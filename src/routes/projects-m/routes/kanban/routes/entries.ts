import express, { Request, Response } from 'express'
import asyncWrapper from '../../../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../../../utils/response.js'

const router = express.Router()

router.post(
    '/:columnId',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { title } = req.body
        const { columnId } = req.params

        if (title) {
            clientError(res, 'Missing required fields')
            return
        }

        const entries = await pb
            .collection('projects_m_kanban_entries')
            .create({
                column: columnId
            })

        success(res, entries)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params
        const { title } = req.body

        const column = await pb
            .collection('projects_m_kanban_entries')
            .update(id, {
                title
            })

        success(res, column)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        const column = await pb
            .collection('projects_m_kanban_entries')
            .delete(id)

        success(res, column)
    })
)

export default router
