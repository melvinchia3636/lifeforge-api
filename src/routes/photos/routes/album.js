import express from 'express'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { body, query, validationResult } from 'express-validator'

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

            const album = await pb.collection('photos_album').getOne(id)

            if (!album.is_public) {
                res.status(401).json({
                    state: 'error',
                    message: 'Invalid authorization credentials'
                })
                return
            }
        }

        const album = await pb.collection('photos_album').getOne(id, {
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

router.get(
    '/valid/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        if (!pb.authStore.isValid) {
            await pb.admins.authWithPassword(
                process.env.PB_EMAIL,
                process.env.PB_PASSWORD
            )
        }

        const { totalItems } = await pb
            .collection('photos_album')
            .getList(1, 1, {
                filter: `id = "${id}"`
            })

        success(res, totalItems === 1)
    })
)

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const albums = await pb.collection('photos_album').getFullList({
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

        const album = await pb.collection('photos_album').getOne(id)

        success(res, album.is_public)
    })
)

router.post(
    '/create',
    body('name').notEmpty(),
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { name } = req.body

        const album = await pb.collection('photos_album').create({ name })

        success(res, album)
    })
)

router.patch(
    '/add-photos/:albumId',
    body('photos').isArray().notEmpty(),
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { albumId } = req.params
        const { photos } = req.body

        for (const photoId of photos) {
            await pb
                .collection('photos_entry')
                .update(photoId, { album: albumId })
            const { id } = await pb
                .collection('photos_entry_dimensions')
                .getFirstListItem(`photo = "${photoId}"`)
            await pb.collection('photos_entry_dimensions').update(id, {
                is_in_album: true
            })
        }

        const { totalItems } = await pb
            .collection('photos_entry')
            .getList(1, 1, {
                filter: `album = "${albumId}"`
            })

        await pb
            .collection('photos_album')
            .update(albumId, { amount: totalItems })

        success(res)
    })
)

router.delete(
    '/remove-photo/:albumId',
    body('photos').isArray().notEmpty(),
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { albumId } = req.params
        const { photos } = req.body

        const { cover } = await pb.collection('photos_album').getOne(albumId)

        for (const photoId of photos) {
            const { id, photo } = await pb
                .collection('photos_entry_dimensions')
                .getOne(photoId)
            await pb.collection('photos_entry').update(photo, { album: '' })
            await pb.collection('photos_entry_dimensions').update(id, {
                is_in_album: false
            })

            if (cover === photo) {
                await pb
                    .collection('photos_album')
                    .update(albumId, { cover: '' })
            }
        }

        const { totalItems } = await pb
            .collection('photos_entry')
            .getList(1, 1, {
                filter: `album = "${albumId}"`
            })

        await pb
            .collection('photos_album')
            .update(albumId, { amount: totalItems })

        success(res)
    })
)

router.delete(
    '/delete/:albumId',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { albumId } = req.params

        await pb.collection('photos_album').delete(albumId)

        success(res)
    })
)

router.patch(
    '/rename/:albumId',
    body('name').notEmpty(),
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { albumId } = req.params
        const { name } = req.body

        if (!name) {
            clientError(res, 'name is required')
            return
        }

        await pb.collection('photos_album').update(albumId, { name })

        success(res)
    })
)

router.post(
    '/set-cover/:albumId/:imageId',
    query('isInAlbum').isBoolean().optional(),
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { imageId, albumId } = req.params
        const { isInAlbum } = req.query

        let image
        if (isInAlbum === 'true') {
            const dim = await pb
                .collection('photos_entry_dimensions')
                .getOne(imageId)
            image = await pb.collection('photos_entry').getOne(dim.photo)
        } else {
            image = await pb.collection('photos_entry').getOne(imageId)
        }

        await pb.collection('photos_album').update(albumId, { cover: image.id })

        success(res)
    })
)

router.post(
    '/set-publicity/:albumId',
    body('publicity').isBoolean(),
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const { albumId } = req.params
        const { publicity } = req.body

        await pb
            .collection('photos_album')
            .update(albumId, { is_public: publicity })

        success(res)
    })
)

export default router
