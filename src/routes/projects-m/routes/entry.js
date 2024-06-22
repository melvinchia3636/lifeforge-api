import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const entries = await pb.collection('projects_m_entry').getFullList()

        success(res, entries)
    })
)

router.post(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const {
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        } = req.body

        if (!name || !icon || !color || !visibility || !status || !category) {
            clientError(res, 'Missing required fields')
            return
        }

        const entry = await pb.collection('projects_m_entry').create({
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        })

        success(res, entry)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const {
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        } = req.body

        const entry = await pb.collection('projects_m_entry').update(id, {
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        })

        success(res, entry)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entry = await pb.collection('projects_m_entry').delete(id)

        success(res, entry)
    })
)

export default router
