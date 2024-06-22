import express from 'express'
import asyncWrapper from '../../../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../../../utils/response.js'

const router = express.Router()

router.get(
    '/:projectId',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { projectId } = req.params

        const columns = await pb
            .collection('projects_m_kanban_column')
            .getFullList({
                filter: `project="${projectId}"`
            })

        success(res, columns)
    })
)

router.post(
    '/:projectId',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, icon } = req.body
        const { projectId } = req.params

        if (!name || !icon) {
            clientError(res, 'Missing required fields')
            return
        }

        const column = await pb.collection('projects_m_kanban_column').create({
            name,
            icon,
            project: projectId
        })

        success(res, column)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { name, icon } = req.body

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const column = await pb
            .collection('projects_m_kanban_column')
            .update(id, {
                name,
                icon
            })

        success(res, column)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const column = await pb
            .collection('projects_m_kanban_column')
            .delete(id)

        success(res, column)
    })
)

export default router
