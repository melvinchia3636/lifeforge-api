import express, { Request, Response } from 'express'
import asyncWrapper from '../../../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../../../utils/response.js'

const router = express.Router()

router.get(
    '/:projectId',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { projectId } = req.params

        const columns = await pb
            .collection('projects_m_kanban_columns')
            .getFullList({
                filter: `project="${projectId}"`,
                expand: 'projects_m_kanban_entries_via_column'
            })

        columns.forEach(column => {
            if (column.expand) {
                column.entries =
                    column.expand.projects_m_kanban_entries_via_column
                delete column.expand
            }
        })

        success(res, columns)
    })
)

router.post(
    '/:projectId',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { name, icon, color } = req.body
        const { projectId } = req.params

        if (!name || !icon || !color) {
            clientError(res, 'Missing required fields')
            return
        }

        const column = await pb.collection('projects_m_kanban_columns').create({
            name,
            icon,
            color,
            project: projectId
        })

        success(res, column)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const column = await pb
            .collection('projects_m_kanban_columns')
            .update(id, {
                name,
                icon,
                color
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
            .collection('projects_m_kanban_columns')
            .delete(id)

        success(res, column)
    })
)

export default router
