import express from 'express'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body, query } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import validate from '../../../utils/validate.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        if (!pb.authStore.isValid) {
            await pb.admins.authWithPassword(
                process.env.PB_EMAIL,
                process.env.PB_PASSWORD
            )

            const album = await pb.collection('photos_albums').getOne(id)

            if (!album.is_public) {
                res.status(401).json({
                    state: 'error',
                    message: 'Invalid authorization credentials'
                })
                return
            }
        }

        const album = await pb.collection('photos_albums').getOne(id, {
            expand: 'cover'
        })

        if (album.expand) {
            const { cover } = album.expand
            album.cover = `${cover.collectionId}/${cover.id}/${cover.image}`
            delete album.expand
        }

        success(res, album)
    })
)

router.get('/valid/:id', validate('photos_albums'))

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const albums = await pb.collection('photos_albums').getFullList({
            expand: 'cover',
            sort: '-created'
        })

        albums.forEach(album => {
            if (album.expand) {
                const { cover } = album.expand
                album.cover = `${cover.collectionId}/${cover.id}/${cover.image}`
                delete album.expand
            }
        })

        success(res, albums)
    })
)

router.get(
    '/check-publicity/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        await pb.admins.authWithPassword(
            process.env.PB_EMAIL,
            process.env.PB_PASSWORD
        )

        const { id } = req.params

        const album = await pb.collection('photos_albums').getOne(id)

        success(res, album.is_public)
    })
)

router.post(
    '/create',
    body('name').notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { name } = req.body

        const album = await pb.collection('photos_albums').create({ name })

        success(res, album)
    })
)

router.patch(
    '/add-photos/:albumId',
    body('photos').isArray().notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { albumId } = req.params
        const { photos } = req.body

        for (const photoId of photos) {
            await pb
                .collection('photos_entries')
                .update(photoId, { album: albumId })
            const { id } = await pb
                .collection('photos_dimensions')
                .getFirstListItem(`photo = "${photoId}"`)
            await pb.collection('photos_dimensions').update(id, {
                is_in_album: true
            })
        }

        const { totalItems } = await pb
            .collection('photos_entries')
            .getList(1, 1, {
                filter: `album = "${albumId}"`
            })

        await pb
            .collection('photos_albums')
            .update(albumId, { amount: totalItems })

        success(res)
    })
)

router.delete(
    '/remove-photo/:albumId',
    body('photos').isArray().notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { albumId } = req.params
        const { photos } = req.body

        const { cover } = await pb.collection('photos_albums').getOne(albumId)

        for (const photoId of photos) {
            const { id, photo } = await pb
                .collection('photos_dimensions')
                .getOne(photoId)
            await pb.collection('photos_entries').update(photo, { album: '' })
            await pb.collection('photos_dimensions').update(id, {
                is_in_album: false
            })

            if (cover === photo) {
                await pb
                    .collection('photos_albums')
                    .update(albumId, { cover: '' })
            }
        }

        const { totalItems } = await pb
            .collection('photos_entries')
            .getList(1, 1, {
                filter: `album = "${albumId}"`
            })

        await pb
            .collection('photos_albums')
            .update(albumId, { amount: totalItems })

        success(res)
    })
)

router.delete(
    '/delete/:albumId',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { albumId } = req.params

        await pb.collection('photos_albums').delete(albumId)

        success(res)
    })
)

router.patch(
    '/rename/:albumId',
    body('name').notEmpty(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { albumId } = req.params
        const { name } = req.body

        if (!name) {
            clientError(res, 'name is required')
            return
        }

        await pb.collection('photos_albums').update(albumId, { name })

        success(res)
    })
)

router.post(
    '/set-cover/:albumId/:imageId',
    query('isInAlbum').isBoolean().optional(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { imageId, albumId } = req.params
        const { isInAlbum } = req.query

        let image
        if (isInAlbum === 'true') {
            const dim = await pb
                .collection('photos_dimensions')
                .getOne(imageId)
            image = await pb.collection('photos_entries').getOne(dim.photo)
        } else {
            image = await pb.collection('photos_entries').getOne(imageId)
        }

        await pb.collection('photos_albums').update(albumId, { cover: image.id })

        success(res)
    })
)

router.post(
    '/set-publicity/:albumId',
    body('publicity').isBoolean(),
    asyncWrapper(async (req, res) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { albumId } = req.params
        const { publicity } = req.body

        await pb
            .collection('photos_albums')
            .update(albumId, { is_public: publicity })

        success(res)
    })
)

export default router
