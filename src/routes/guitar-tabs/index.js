import express from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import pdfThumbnail from 'pdf-thumbnail'
import pdfPageCounter from 'pdf-page-counter'
import fs from 'fs'
import { clientError, success } from '../../utils/response.js'
import { uploadMiddleware } from '../../middleware/uploadMiddleware.js'

const router = express.Router()

let processing = 'empty'
let left = 0
let total = 0

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const page = req.query.page || 1
        const search = decodeURIComponent(req.query.query || '')

        const entries = await pb
            .collection('guitar_tabs_entry')
            .getList(page, 20, {
                filter: `name~"${search}"`
            })

        success(res, entries)
    })
)

router.post(
    '/upload',
    uploadMiddleware,
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const files = req.files

        if (processing === 'in_progress') {
            for (const file of files) {
                fs.unlinkSync(file.path)
            }
            clientError(res, 'Already processing')
            return
        }

        processing = 'in_progress'
        left = files.length
        total = files.length
        res.status(202).json({
            state: 'accepted',
            message: 'Processing started'
        })

        for (const file of files) {
            try {
                const name = decodeURIComponent(file.originalname)
                const path = file.path
                const buffer = fs.readFileSync(path)

                const thumbnail = await pdfThumbnail(buffer, {
                    compress: {
                        type: 'JPEG', //default
                        quality: 70 //default
                    }
                })

                const { numpages } = await pdfPageCounter(buffer)

                thumbnail
                    .pipe(fs.createWriteStream(`uploads/${name}.jpg`))
                    .once('close', async () => {
                        const thumbnailBuffer = fs.readFileSync(
                            `uploads/${name}.jpg`
                        )

                        await pb.collection('guitar_tabs_entry').create(
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
    asyncWrapper(async (req, res) => {
        success(res, { status: processing, left, total })
    })
)

export default router
