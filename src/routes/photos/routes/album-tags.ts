import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { successWithBaseResponse } from '../../../utils/response.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IPhotoAlbumTag } from '../../../interfaces/photos_interfaces.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IPhotoAlbumTag[]>>) => {
            const { pb } = req

            const tags = await pb
                .collection('photos_album_tags')
                .getFullList<IPhotoAlbumTag>()

            for (const tag of tags) {
                const { totalItems } = await pb
                    .collection('photos_albums')
                    .getList(1, 1, {
                        filter: `tags ~ "${tag.id}"`
                    })

                tag.count = totalItems
            }

            successWithBaseResponse(res, tags)
        }
    )
)

router.post(
    '/',
    body('name').isString(),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IPhotoAlbumTag>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name } = req.body

            const tag = await pb
                .collection('photos_album_tags')
                .create<IPhotoAlbumTag>({
                    name
                })

            tag.count = 0

            successWithBaseResponse(res, tag)
        }
    )
)

router.patch(
    '/:id',
    body('name').isString(),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IPhotoAlbumTag>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name } = req.body

            const updated = await pb
                .collection('photos_album_tags')
                .update<IPhotoAlbumTag>(id, {
                    name
                })

            successWithBaseResponse(res, updated)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('photos_album_tags').delete(id)

        successWithBaseResponse(res)
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

        successWithBaseResponse(res)
    })
)

export default router
