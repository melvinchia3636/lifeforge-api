import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        let photos = await pb.collection('photos_dimensions').getFullList({
            filter: 'is_deleted=true',
            expand: 'photo',
            fields: 'expand.photo.id,expand.photo.image,expand,shot_time.photo.raw,width,height,id,expand.photo.collectionId',
            sort: '-shot_time'
        })

        photos = photos.map(photo => ({
            width: photo.width,
            height: photo.height,
            ...photo.expand.photo,
            photoId: photo.expand.photo.id,
            id: photo.id,
            has_raw: photo.expand.photo.raw !== '',
            shot_time: photo.shot_time
        }))

        photos.forEach(photo => {
            delete photo.raw
        })

        success(res, photos)
    })
)

router.delete(
    '/empty',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const photos = await pb.collection('photos_dimensions').getFullList({
            filter: 'is_deleted=true'
        })

        await Promise.all(
            photos.map(async photo => {
                await pb.collection('photos_dimensions').delete(photo.id)
                await pb.collection('photos_entries').delete(photo.photo)
            })
        )

        success(res, 'All photos in trash have been deleted')
    })
)

export default router
