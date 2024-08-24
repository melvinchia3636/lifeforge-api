import express, { Request, Response } from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import pdfThumbnail from 'pdf-thumbnail'
// @ts-expect-error no type for this
import pdfPageCounter from 'pdf-page-counter'
import fs from 'fs'
import { clientError, successWithBaseResponse } from '../../utils/response.js'
import { uploadMiddleware } from '../../middleware/uploadMiddleware.js'
import { BaseResponse } from '../../interfaces/base_response.js'
import IGuitarTabsEntry from '../../interfaces/guitar_tabs_interfaces.js'
import { ListResult } from 'pocketbase'
import { WithoutPBDefault } from '../../interfaces/pocketbase_interfaces.js'

const router = express.Router()

let processing = 'empty'
let left = 0
let total = 0

router.get(
    '/list',
    asyncWrapper(
        async (
            req: Request<
                {},
                {},
                {},
                {
                    query: string
                    page: number
                }
            >,
            res: Response<BaseResponse<ListResult<IGuitarTabsEntry[]>>>
        ) => {
            const { pb } = req
            const page = req.query.page || 1
            const search = decodeURIComponent(req.query.query || '')

            const entries = await pb
                .collection('guitar_tabs_entries')
                .getList<IGuitarTabsEntry[]>(page, 20, {
                    filter: `name~"${search}" || author~"${search}"`,
                    sort: 'name'
                })

            successWithBaseResponse(res, entries)
        }
    )
)

router.post(
    '/upload',
    uploadMiddleware,
    asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
        const { pb } = req
        const files = req.files

        if (!files) {
            clientError(res, 'No files provided')
            return
        }

        if (processing === 'in_progress') {
            for (const file of files as Express.Multer.File[]) {
                fs.unlinkSync(file.path)
            }
            clientError(res, 'Already processing')
            return
        }

        let groups: Record<
            string,
            {
                pdf: Express.Multer.File | null
                mscz: Express.Multer.File | null
                mp3: Express.Multer.File | null
            }
        > = {}

        for (const file of files as Express.Multer.File[]) {
            const decodedName = decodeURIComponent(file.originalname)
            const extension = decodedName.split('.').pop()

            if (!extension || !['mscz', 'mp3', 'pdf'].includes(extension)) {
                continue
            }

            const name = decodedName.split('.').slice(0, -1).join('.')

            if (!groups[name]) {
                groups[name] = {
                    pdf: null,
                    mscz: null,
                    mp3: null
                }
            }

            groups[name][extension as 'pdf' | 'mscz' | 'mp3'] = file
        }

        for (const group of Object.values(groups)) {
            if (!group.pdf) {
                for (const file of Object.values(group)) {
                    if (file) {
                        fs.unlinkSync(file.path)
                    }
                }
            }
        }

        groups = Object.fromEntries(
            Object.entries(groups).filter(([_, group]) => group.pdf)
        )

        processing = 'in_progress'
        left = Object.keys(groups).length
        total = Object.keys(groups).length
        res.status(202).json({
            state: 'accepted',
            message: 'Processing started'
        })

        for (const group of Object.values(groups)) {
            try {
                const file = group.pdf!
                const decodedName = decodeURIComponent(file.originalname)
                const name = decodedName.split('.').slice(0, -1).join('.')
                const path = file.path
                const buffer = fs.readFileSync(path)

                const thumbnail = await pdfThumbnail(buffer, {
                    compress: {
                        type: 'JPEG',
                        quality: 70
                    }
                })

                const { numpages } = await pdfPageCounter(buffer)

                thumbnail
                    .pipe(fs.createWriteStream(`uploads/${decodedName}.jpg`))
                    .once('close', async () => {
                        const thumbnailBuffer = fs.readFileSync(
                            `uploads/${decodedName}.jpg`
                        )

                        const otherFiles: {
                            audio: File | null
                            musescore: File | null
                        } = {
                            audio: null,
                            musescore: null
                        }

                        if (group.mscz) {
                            otherFiles.musescore = new File(
                                [fs.readFileSync(group.mscz.path)],
                                group.mscz.originalname
                            )
                        }

                        if (group.mp3) {
                            otherFiles.audio = new File(
                                [fs.readFileSync(group.mp3.path)],
                                group.mp3.originalname
                            )
                        }

                        await pb.collection('guitar_tabs_entries').create(
                            {
                                name,
                                thumbnail: new File(
                                    [thumbnailBuffer],
                                    `${decodedName}.jpeg`
                                ),
                                author: '',
                                pdf: new File([buffer], decodedName),
                                pageCount: numpages,
                                ...otherFiles
                            },
                            {
                                $autoCancel: false
                            }
                        )

                        fs.unlinkSync(path)
                        fs.unlinkSync(`uploads/${decodedName}.jpg`)
                        if (group.mscz) {
                            fs.unlinkSync(group.mscz.path)
                        }
                        if (group.mp3) {
                            fs.unlinkSync(group.mp3.path)
                        }
                        left--

                        if (left === 0) {
                            processing = 'completed'
                        }
                    })
            } catch (err) {
                console.log(err)
                processing = 'failed'
                const allFilesLeft = fs.readdirSync('uploads')
                for (const file of allFilesLeft) {
                    fs.unlinkSync(`uploads/${file}`)
                }

                left = 0
                total = 0
                break
            }
        }
    })
)

router.get(
    '/process-status',
    asyncWrapper(
        async (
            _: Request,
            res: Response<
                BaseResponse<{
                    status: string
                    left: number
                    total: number
                }>
            >
        ) => {
            successWithBaseResponse(res, { status: processing, left, total })
        }
    )
)

router.put(
    '/update/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IGuitarTabsEntry>>) => {
            const { pb } = req
            const { id } = req.params
            const { name, author } = req.body

            const updatedentries: IGuitarTabsEntry = await pb
                .collection('guitar_tabs_entries')
                .update(id, {
                    name,
                    author
                })

            successWithBaseResponse(res, updatedentries)
        }
    )
)

export default router
