import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => list(req, res, 'projects_m_statuses'))
)

router.post(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, icon, color } = req.body

        if (!name || !icon || !color) {
            clientError(res, 'Missing required fields')
            return
        }

        const status = await pb.collection('projects_m_statuses').create({
            name,
            icon,
            color
        })

        success(res, status)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const status = await pb.collection('projects_m_statuses').update(id, {
            name,
            icon,
            color
        })

        success(res, status)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const status = await pb.collection('projects_m_statuses').delete(id)

        success(res, status)
    })
)

export default router
