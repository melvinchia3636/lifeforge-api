import express from 'express'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const tags = await pb.collection('todo_tag').getFullList()

        success(res, tags)
    })
)

router.post(
    '/create',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name } = req.body

        if (!name) {
            clientError(res, 'name is required')
            return
        }

        const tag = await pb.collection('todo_tag').create({
            name
        })

        success(res, tag)
    })
)

router.patch(
    '/update/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { name } = req.body

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        if (!name) {
            clientError(res, 'name is required')
            return
        }

        const tag = await pb.collection('todo_tag').update(id, {
            name
        })

        success(res, tag)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        await pb.collection('todo_tag').delete(id)
        success(res)
    })
)

export default router
