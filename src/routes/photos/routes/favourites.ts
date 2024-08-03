// @ts-nocheck
import express, { Request, Response } from 'express'
import { successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        let photos = await pb.collection('photos_dimensions').getFullList({
            filter: 'is_favourite = true',
            expand: 'photo',
            fields: 'expand.photo.id,expand.photo.image,expand.photo.raw,width,height,id,expand.photo.collectionId',
            sort: '-shot_time'
        })

        photos = photos.map(photo => ({
            width: photo.width,
            height: photo.height,
            ...photo.expand.photo,
            photoId: photo.expand.photo.id,
            id: photo.id
        }))

        successWithBaseResponse(res, photos)
    })
)

router.patch(
    '/add-photos',
    [
        body('photos').isArray(),
        body('photos.*').isString(),
        body('isInAlbum').isBoolean()
    ],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { photos } = req.body

        const { isInAlbum } = req.query

        for (const id of photos) {
            let dim

            if (isInAlbum === 'true') {
                dim = await pb.collection('photos_dimensions').getOne(id)
            } else {
                dim = await pb
                    .collection('photos_dimensions')
                    .getFirstListItem(`photo = "${id}"`)
            }

            if (dim) {
                await pb.collection('photos_dimensions').update(dim.id, {
                    is_favourite: true
                })
            } else {
                res.status(404).json({
                    state: 'error',
                    message: 'Photo not found'
                })
            }
        }

        successWithBaseResponse(res)
    })
)

export default router
