import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { success } from '../../../utils/response.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const tags = await pb.collection('photos_album_tags').getFullList()

        for (const tag of tags) {
            const { totalItems } = await pb
                .collection('photos_albums')
                .getList(1, 1, {
                    filter: `tags ~ "${tag.id}"`
                })

            tag.count = totalItems
        }

        success(res, tags)
    })
)

router.patch(
    '/update-album/:albumId',
    body('tags').isArray(),
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { albumId } = req.params
        const { tags } = req.body

        await pb.collection('photos_albums').update(albumId, {
            tags
        })

        success(res)
    })
)

export default router
