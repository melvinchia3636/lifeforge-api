import express from 'express'
import multer from 'multer'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body, query } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/:containerId',
    query('archived').isBoolean().optional(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { containerId } = req.params
        const { archived } = req.query

        const ideas = await pb.collection('idea_box_entries').getFullList({
            filter: `container = "${containerId}" && archived = ${archived || 'false'} && folder=""`,
            sort: '-pinned,-created'
        })
        success(res, ideas)
    })
)

router.get(
    '/:containerId/:folderId',
    query('archived').isBoolean().optional(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { folderId } = req.params
        const { archived } = req.query

        const ideas = await pb.collection('idea_box_entries').getFullList({
            filter: `folder = "${folderId}" && archived = ${archived || 'false'}`,
            sort: '-pinned,-created'
        })
        success(res, ideas)
    })
)

router.post(
    '/:containerId',
    multer().single('image'),
    [
        body('title').isString().optional(),
        body('content').isString().optional(),
        body('link').isString().optional(),
        body('type').isString().isIn(['text', 'link', 'image']).notEmpty(),
        body('imageLink').isString().optional(),
        body('folder').isString().optional(),
        body('file').custom((value, { req }) => {
            if (req.body.type === 'image' && !req.file && !req.body.imageLink) {
                throw new Error('Image is required')
            }
            return true
        })
    ],
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { title, content, link, type, imageLink, folder } = req.body

        const { file } = req
        const { containerId } = req.params

        let data
        switch (type) {
            case 'text':
                data = {
                    content,
                    type,
                    container: containerId
                }
                break
            case 'link':
                data = {
                    title,
                    content: link,
                    type,
                    container: containerId
                }
                break
            case 'image':
                if (imageLink) {
                    await fetch(imageLink).then(async response => {
                        const buffer = await response.arrayBuffer()
                        data = {
                            title,
                            type,
                            image: new File([buffer], 'image.jpg', {
                                type: 'image/jpeg'
                            }),
                            container: containerId
                        }
                    })
                } else {
                    data = {
                        title,
                        type,
                        image: new File([file.buffer], file.originalname, {
                            type: file.mimetype
                        }),
                        container: containerId
                    }
                }
                break
            default:
                clientError(res, 'Invalid type')
                return
        }

        if (folder) data.folder = folder

        const idea = await pb.collection('idea_box_entries').create(data)
        await pb.collection('idea_box_containers').update(containerId, {
            [`${type}_count+`]: 1
        })

        success(res, idea)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const idea = await pb.collection('idea_box_entries').getOne(id)
        await pb.collection('idea_box_entries').delete(id)
        await pb.collection('idea_box_containers').update(idea.container, {
            [`${idea.type}_count-`]: 1
        })

        success(res)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const { title, content, link, type } = req.body

        let data
        switch (type) {
            case 'text':
                data = {
                    content,
                    type
                }
                break
            case 'link':
                data = {
                    title,
                    content: link,
                    type
                }
                break
            default:
                clientError(res, 'Invalid type')
                return
        }

        await pb.collection('idea_box_entries').update(id, data)

        success(res)
    })
)

router.post(
    '/pin/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const idea = await pb.collection('idea_box_entries').getOne(id)
        await pb.collection('idea_box_entries').update(id, {
            pinned: !idea.pinned
        })

        success(res)
    })
)

router.post(
    '/archive/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const idea = await pb.collection('idea_box_entries').getOne(id)
        await pb.collection('idea_box_entries').update(id, {
            archived: !idea.archived,
            pinned: false
        })

        success(res)
    })
)

export default router
