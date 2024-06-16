import express from 'express'
import multer from 'multer'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body, query } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/list/:containerId',
    query('archived').isBoolean().optional(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { containerId } = req.params
        const { archived } = req.query

        const ideas = await pb.collection('idea_box_entry').getFullList({
            filter: `container = "${containerId}" && archived = ${archived || 'false'} && folder=""`,
            sort: '-pinned,-created'
        })
        success(res, ideas)
    })
)

router.get(
    '/list/:containerId/:folderId',
    query('archived').isBoolean().optional(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { folderId } = req.params
        const { archived } = req.query

        const ideas = await pb.collection('idea_box_entry').getFullList({
            filter: `folder = "${folderId}" && archived = ${archived || 'false'}`,
            sort: '-pinned,-created'
        })
        success(res, ideas)
    })
)

router.post(
    '/create/:containerId',
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
                    if (
                        !imageLink.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif)$/)
                    ) {
                        clientError(res, 'Invalid image link')
                        return
                    }

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

        const idea = await pb.collection('idea_box_entry').create(data)
        await pb.collection('idea_box_container').update(containerId, {
            [`${type}_count+`]: 1
        })

        success(res, idea)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const idea = await pb.collection('idea_box_entry').getOne(id)
        await pb.collection('idea_box_entry').delete(id)
        await pb.collection('idea_box_container').update(idea.container, {
            [`${idea.type}_count-`]: 1
        })

        success(res)
    })
)

router.patch(
    '/update/:id',
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

        await pb.collection('idea_box_entry').update(id, data)

        success(res)
    })
)

router.patch(
    '/pin/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const idea = await pb.collection('idea_box_entry').getOne(id)
        await pb.collection('idea_box_entry').update(id, {
            pinned: !idea.pinned
        })

        success(res)
    })
)

router.patch(
    '/archive/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const idea = await pb.collection('idea_box_entry').getOne(id)
        await pb.collection('idea_box_entry').update(id, {
            archived: !idea.archived,
            pinned: false
        })

        success(res)
    })
)

export default router
