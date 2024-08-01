import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const folder = await pb.collection('idea_box_folders').getOne(id)
        success(res, folder)
    })
)

router.get(
    '/list/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const folders = await pb.collection('idea_box_folders').getFullList({
            filter: `container = "${id}"`,
            sort: 'name'
        })
        success(res, folders)
    })
)

router.post(
    '/',
    [
        body('name').exists().notEmpty(),
        body('container').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { name, container, icon, color } = req.body
        const folder = await pb.collection('idea_box_folders').create({
            name,
            container,
            icon,
            color
        })

        success(res, folder)
    })
)

router.patch(
    '/:id',
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

        await pb.collection('idea_box_folders').update(id, {
            name,
            icon,
            color
        })

        success(res)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('idea_box_folders').delete(id)
        success(res)
    })
)

router.post(
    '/idea/:folderId',
    body('ideaId').exists().notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { folderId } = req.params
        const { ideaId } = req.body

        await pb.collection('idea_box_entries').update(ideaId, {
            folder: folderId
        })

        success(res)
    })
)

router.delete(
    '/idea/:folderId',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { folderId } = req.params
        const { ideaId } = req.body

        if (!folderId) {
            clientError(res, 'folderId is required')
            return
        }

        if (!ideaId) {
            clientError(res, 'Idea id is required')
            return
        }

        await pb.collection('idea_box_entries').update(ideaId, {
            folder: ''
        })

        success(res)
    })
)

export default router
