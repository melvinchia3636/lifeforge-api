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

        processing = 'in_progress'
        left = files.length as number
        total = files.length as number
        res.status(202).json({
            state: 'accepted',
            message: 'Processing started'
        })

        for (const file of files as Express.Multer.File[]) {
            try {
                const name = decodeURIComponent(file.originalname)
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
                    .pipe(fs.createWriteStream(`uploads/${name}.jpg`))
                    .once('close', async () => {
                        const thumbnailBuffer = fs.readFileSync(
                            `uploads/${name}.jpg`
                        )

                        await pb.collection('guitar_tabs_entries').create(
                            {
                                name,
                                thumbnail: new File(
                                    [thumbnailBuffer],
                                    `${name}.jpeg`
                                ),
                                file: new File([buffer], name),
                                pageCount: numpages
                            },
                            {
                                $autoCancel: false
                            }
                        )

                        fs.unlinkSync(path)
                        fs.unlinkSync(`uploads/${name}.jpg`)
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
