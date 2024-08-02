import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => list(req, res, 'projects_m_visibilities'))
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

        const technology = await pb
            .collection('projects_m_technologies')
            .create({
                name,
                icon
            })

        success(res, technology)
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

        const technology = await pb
            .collection('projects_m_technologies')
            .update(id, {
                name,
                icon
            })

        success(res, technology)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const technology = await pb
            .collection('projects_m_technologies')
            .delete(id)

        success(res, technology)
    })
)

export default router
