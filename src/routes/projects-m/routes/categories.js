import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const categorys = await pb
            .collection('projects_m_categories')
            .getFullList()

        success(res, categorys)
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

        const category = await pb.collection('projects_m_categories').create({
            name,
            icon
        })

        success(res, category)
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

        const category = await pb.collection('projects_m_categories').update(id, {
            name,
            icon
        })

        success(res, category)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const category = await pb.collection('projects_m_categories').delete(id)

        success(res, category)
    })
)

export default router
