import express from 'express'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/list/:id',
    asyncWrapper(async (req, res) => {
        if (!req.params.id) {
            clientError(res, 'id is required')

            return
        }

        const { pb } = req
        const subjects = await pb.collection('notes_subject').getFullList({
            filter: `workspace = "${req.params.id}"`
        })

        success(res, subjects)
    })
)

router.post(
    '/create',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const { title } = req.body
        const existing = await pb.collection('notes_subject').getFullList({
            filter: `title = "${title}" && workspace = "${req.body.workspace}"`
        })
        if (existing.length > 0) {
            res.status(400).json({
                state: 'error',
                message: 'Subject already exists'
            })

            return
        }
        const subject = await pb.collection('notes_subject').create(req.body)

        success(res, subject)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        if (!req.params.id) {
            clientError(res, 'id is required')

            return
        }

        const { pb } = req
        await pb.collection('notes_subject').delete(req.params.id)

        success(res, null)
    })
)

router.patch(
    '/update/:id',
    asyncWrapper(async (req, res) => {
        if (!req.params.id) {
            clientError(res, 'id is required')

            return
        }

        const { pb } = req
        const subject = await pb
            .collection('notes_subject')
            .update(req.params.id, req.body)

        success(res, subject)
    })
)

export default router
