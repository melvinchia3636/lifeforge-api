import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const visibilities = await pb
            .collection('projects_m_visibilities')
            .getFullList()

        success(res, visibilities)
    })
)

router.post(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, icon } = req.body

        if (!name || !icon) {
            clientError(res, 'Missing required fields')
            return
        }

        const visibility = await pb.collection('projects_m_visibilities').create({
            name,
            icon
        })

        success(res, visibility)
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

        const visibility = await pb
            .collection('projects_m_visibilities')
            .update(id, {
                name,
                icon
            })

        success(res, visibility)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const visibility = await pb
            .collection('projects_m_visibilities')
            .delete(id)

        success(res, visibility)
    })
)

export default router
