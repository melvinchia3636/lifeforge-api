import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
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
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

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
