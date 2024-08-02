import express, { Request, Response } from 'express'
import multer from 'multer'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body, query } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import {
    IIdeaBoxEntry,
    IIdeaBoxFolder
} from '../../../interfaces/ideabox_interfaces.js'
import { BaseResponse } from '../../../interfaces/base_response.js'

const router = express.Router()

router.get(
    '/:containerId',
    query('archived').isBoolean().optional(),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry[]>>) => {
            if (hasError(req, res)) return

            const { containerId } = req.params
            const { archived } = req.query

            await list(req, res, 'idea_box_entries', {
                filter: `container = "${containerId}" && archived = ${archived || 'false'} && folder=""`,
                sort: '-pinned,-created'
            })
        }
    )
)

router.get(
    '/:containerId/:folderId',
    query('archived').isBoolean().optional(),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry[]>>) => {
            if (hasError(req, res)) return

            const { folderId } = req.params
            const { archived } = req.query

            await list(req, res, 'idea_box_entries', {
                filter: `folder = "${folderId}" && archived = ${archived || 'false'}`,
                sort: '-pinned,-created'
            })
        }
    )
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
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { title, content, link, type, imageLink, folder } = req.body

            const { file } = req
            const { containerId } = req.params

            let data: Pick<
                IIdeaBoxEntry,
                'title' | 'content' | 'type' | 'container' | 'folder'
            > & {
                image?: File
            } = {
                type,
                container: containerId,
                folder
            }

            switch (type) {
                case 'text':
                    data['content'] = content
                    break
                case 'link':
                    data['title'] = title
                    data['content'] = link
                    break
                case 'image':
                    if (imageLink) {
                        await fetch(imageLink).then(async response => {
                            const buffer = await response.arrayBuffer()
                            data['image'] = new File([buffer], 'image.jpg', {
                                type: 'image/jpeg'
                            })
                            data['title'] = title
                        })
                    } else {
                        if (!file) {
                            clientError(res, 'Image is required')
                            return
                        }

                        data['image'] = new File(
                            [file.buffer],
                            file.originalname,
                            {
                                type: file.mimetype
                            }
                        )
                        data['title'] = title
                    }
                    break
                default:
                    clientError(res, 'Invalid type')
                    return
            }

            if (!data) {
                clientError(res, 'Invalid type')
                return
            }

            const idea: IIdeaBoxEntry = await pb
                .collection('idea_box_entries')
                .create(data)
            await pb.collection('idea_box_containers').update(containerId, {
                [`${type}_count+`]: 1
            })

            success(res, idea)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
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

            const entry: IIdeaBoxEntry = await pb
                .collection('idea_box_entries')
                .update(id, data)

            success(res, entry)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
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

router.post(
    '/pin/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
            const { pb } = req
            const { id } = req.params

            const idea = await pb.collection('idea_box_entries').getOne(id)
            const entry: IIdeaBoxEntry = await pb
                .collection('idea_box_entries')
                .update(id, {
                    pinned: !idea.pinned
                })

            success(res, entry)
        }
    )
)

router.post(
    '/archive/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
            const { pb } = req
            const { id } = req.params

            const idea = await pb.collection('idea_box_entries').getOne(id)
            const entry: IIdeaBoxEntry = await pb
                .collection('idea_box_entries')
                .update(id, {
                    archived: !idea.archived,
                    pinned: false
                })

            success(res, entry)
        }
    )
)

export default router
