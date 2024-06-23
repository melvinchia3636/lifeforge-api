import express from 'express'
import asyncWrapper from '../../../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../../../utils/response.js'

const router = express.Router()

router.post(
    '/:columnId',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { title } = req.body
        const { columnId } = req.params

        if (title) {
            clientError(res, 'Missing required fields')
            return
        }

        const entry = await pb.collection('projects_m_kanban_entry').create({
            column: columnId
        })

        success(res, entry)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { title } = req.body

        const column = await pb
            .collection('projects_m_kanban_entry')
            .update(id, {
                title
            })

        success(res, column)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const column = await pb.collection('projects_m_kanban_entry').delete(id)

        success(res, column)
    })
)

export default router
