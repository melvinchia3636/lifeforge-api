import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import validate from '../../../common/validate.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const entries = await pb.collection('projects_m_entries').getFullList()

        success(res, entries)
    })
)

router.get(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('projects_m_entries').getOne(id)

        success(res, entries)
    })
)

router.get('/valid/:id', validate('projects_m_entries'))

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

        const entries = await pb.collection('projects_m_entries').create({
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        })

        success(res, entries)
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

        const entries = await pb.collection('projects_m_entries').update(id, {
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        })

        success(res, entries)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('projects_m_entries').delete(id)

        success(res, entries)
    })
)

export default router
