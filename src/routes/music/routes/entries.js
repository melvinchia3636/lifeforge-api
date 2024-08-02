import express from 'express'
import fs from 'fs'
import mime from 'mime-types'
import * as mm from 'music-metadata'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { body, validationResult } from 'express-validator'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

let importProgress = 'empty'

router.get(
    '/',
    asyncWrapper(async (req, res) =>
        list(req, res, 'music_entries', {
            sort: 'name'
        })
    )
)

router.get(
    '/import-status',
    asyncWrapper(async (req, res) => {
        success(res, { status: importProgress })
    })
)

router.post(
    '/import',
    asyncWrapper(async (req, res) => {
        if (importProgress === 'in_progress') {
            res.status(400).json({ error: 'Already importing' })
            return
        }

        importProgress = 'in_progress'
        res.status(202).json({
            state: 'accepted',
            message: 'Download started'
        })

        try {
            const { pb } = req
            fs.readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`)
                .filter(file => file.startsWith('.'))
                .forEach(file =>
                    fs.unlinkSync(
                        `/media/${process.env.DATABASE_OWNER}/uploads/${file}`
                    )
                )

            const newFiles = fs
                .readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`)
                .filter(
                    file =>
                        !file.startsWith('.') &&
                        (mime.lookup(file)
                            ? mime.lookup(file).startsWith('audio')
                            : false)
                )

            for (const file of newFiles) {
                const fp = `/media/${process.env.DATABASE_OWNER}/uploads/${file}`
                const fileBuffer = fs.readFileSync(fp)
                const metadata = await mm.parseFile(fp)
                const artist = metadata.common.artist || 'Unknown'
                const duration = metadata.format.duration || 0

                await pb.collection('music_entries').create({
                    name:
                        metadata.common.title ||
                        file.split('.').slice(0, -1).join('.'),
                    author: artist,
                    duration,
                    file: new File([fileBuffer], file)
                })

                fs.unlinkSync(fp)
            }
            importProgress = 'completed'
        } catch {
            importProgress = 'failed'
        }
    })
)

router.patch(
    '/:id',
    [body('name').notEmpty(), body('author').notEmpty()],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return clientError(res, result.array())
        }

        const { pb } = req
        const { id } = req.params
        const { name, author } = req.body

        await pb.collection('music_entries').update(id, {
            name,
            author
        })

        success(res)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('music_entries').delete(id)

        success(res, { id })
    })
)

router.post(
    '/favourite/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('music_entries').getOne(id)
        await pb.collection('music_entries').update(id, {
            is_favourite: !entries.is_favourite
        })

        success(res, { is_favourite: !entries.favourite })
    })
)

export default router
