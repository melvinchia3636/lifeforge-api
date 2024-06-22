import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const technologies = await pb
            .collection('projects_m_technology')
            .getFullList()

        success(res, technologies)
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

        const technology = await pb.collection('projects_m_technology').create({
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
            .collection('projects_m_technology')
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
            .collection('projects_m_technology')
            .delete(id)

        success(res, technology)
    })
)

export default router
