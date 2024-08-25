import express, { Request, Response } from 'express'
import fs from 'fs'
import mime from 'mime-types'
import * as mm from 'music-metadata'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import { body, validationResult } from 'express-validator'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IMusicEntry } from '../../../interfaces/music_interfaces.js'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

let importProgress: 'in_progress' | 'completed' | 'failed' | 'empty' = 'empty'

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IMusicEntry[]>>) =>
            list(req, res, 'music_entries', {
                sort: 'name'
            })
    )
)

router.get(
    '/import-status',
    asyncWrapper(
        async (
            _: Request,
            res: Response<
                BaseResponse<{
                    status: 'in_progress' | 'completed' | 'failed' | 'empty'
                }>
            >
        ) => {
            successWithBaseResponse(res, { status: importProgress })
        }
    )
)

router.post(
    '/import',
    asyncWrapper(async (req: Request, res: Response) => {
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
            fs.readdirSync(`/home/pi/${process.env.DATABASE_OWNER}/medium`)
                .filter(file => file.startsWith('.'))
                .forEach(file =>
                    fs.unlinkSync(
                        `/home/pi/${process.env.DATABASE_OWNER}/medium/${file}`
                    )
                )

            const newFiles = fs
                .readdirSync(`/home/pi/${process.env.DATABASE_OWNER}/medium`)
                .filter(file => {
                    const fileMime = mime.lookup(file)
                    !file.startsWith('.') &&
                        (fileMime ? fileMime.startsWith('audio') : false)
                })

            for (const file of newFiles) {
                const fp = `/home/pi/${process.env.DATABASE_OWNER}/medium/${file}`
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
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IMusicEntry>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name, author } = req.body

            const entry: IMusicEntry = await pb
                .collection('music_entries')
                .update(id, {
                    name,
                    author
                })

            successWithBaseResponse(res, entry)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('music_entries').delete(id)

        successWithBaseResponse(res)
    })
)

router.post(
    '/favourite/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IMusicEntry>>) => {
            const { pb } = req
            const { id } = req.params

            const entries = await pb.collection('music_entries').getOne(id)
            const entry: IMusicEntry = await pb
                .collection('music_entries')
                .update(id, {
                    is_favourite: !entries.is_favourite
                })

            successWithBaseResponse(res, entry)
        }
    )
)

export default router
