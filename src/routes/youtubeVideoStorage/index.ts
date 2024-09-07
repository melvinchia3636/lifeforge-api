import { exec, spawn } from 'child_process'
import express, { Request, Response } from 'express'
import { BaseResponse } from '../../interfaces/base_response.js'
import { IYoutubeData } from '../../interfaces/music_interfaces.js'
import asyncWrapper from '../../utils/asyncWrapper.js'
import {
    clientError,
    serverError,
    successWithBaseResponse
} from '../../utils/response.js'
import { body, param } from 'express-validator'
import { v4 } from 'uuid'
import hasError from '../../utils/checkError.js'
import fs from 'fs'
import moment from 'moment'
import { list } from '../../utils/CRUD.js'
import { IYoutubeVidesStorageEntry } from '../../interfaces/youtube_video_storage_interfaces.js'

const router = express.Router()

let downloading: 'empty' | 'in_progress' | 'completed' | 'failed' = 'empty'
let progress = 0

function downloadVideo(
    url: string,
    output: string,
    progressCallback: (progress: number) => void
) {
    return new Promise((resolve, reject) => {
        const ytDlp = spawn(`${process.cwd()}/src/bin/yt-dlp`, [
            '--newline', // Ensures that each line of output is printed immediately
            '-S',
            'ext:mp4:m4a',
            '-o',
            output, // Output format
            '--write-thumbnail', // Write thumbnail to file
            url // Video URL
        ])

        ytDlp.stdout.on('data', data => {
            const output = data.toString()

            const progressMatch = output.match(/\[download\]\s+(\d+\.\d+)%/)
            if (progressMatch) {
                const progress = parseFloat(progressMatch[1])
                progressCallback(progress)
            }
        })

        ytDlp.on('error', err => {
            console.error(`yt-dlp error: ${err}`)
            reject(err)
        })

        ytDlp.stderr.on('data', data => {
            console.error(`yt-dlp error: ${data}`)
            reject(data)
        })

        ytDlp.on('close', code => {
            console.log(`yt-dlp process exited with code ${code}`)
            resolve('done')
        })
    })
}

router.get(
    '/video/thumbnail/:id',
    param('id')
        .isString()
        .matches(/^[a-zA-Z0-9_-]{11}$/),
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { id } = req.params

        if (
            !fs.existsSync(
                `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${id}.webp`
            )
        ) {
            clientError(res, 'Thumbnail not found')
            return
        }

        res.sendFile(
            `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${id}.webp`
        )
    })
)

router.get(
    '/video/stream/:id',
    param('id')
        .isString()
        .matches(/^[a-zA-Z0-9_-]{11}$/),
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { id } = req.params

        if (
            !fs.existsSync(
                `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${id}.mp4`
            )
        ) {
            clientError(res, 'Video not found')
            return
        }

        res.sendFile(
            `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${id}.mp4`
        )
    })
)

router.get(
    '/video',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IYoutubeVidesStorageEntry[]>>
        ) => list(req, res, 'youtube_video_storage_entry')
    )
)

router.get(
    '/video/get-info/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IYoutubeData>>) => {
            const { id } = req.params

            if (!id.match(/^[a-zA-Z0-9_-]{11}$/)) {
                clientError(res, 'Invalid video ID')
                return
            }

            exec(
                `${process.cwd()}/src/bin/yt-dlp --skip-download --print "title,upload_date,uploader,duration,view_count,like_count,thumbnail" "https://www.youtube.com/watch?v=${id}"`,
                (err, stdout) => {
                    if (err) {
                        serverError(
                            res,
                            err?.message ??
                                err?.message.includes('Video unavailable')
                                ? 'Video unavailable'
                                : 'An error occurred'
                        )
                        return
                    }

                    const [
                        title,
                        uploadDate,
                        uploader,
                        duration,
                        viewCount,
                        likeCount,
                        thumbnail
                    ] = stdout.split('\n')

                    const response: IYoutubeData = {
                        title,
                        uploadDate,
                        uploader,
                        duration,
                        viewCount: +viewCount,
                        likeCount: +likeCount,
                        thumbnail
                    }

                    successWithBaseResponse(res, response)
                }
            )
        }
    )
)

router.post(
    '/video/async-download/:id',
    [
        body('metadata').isObject(),
        param('id')
            .isString()
            .matches(/^[a-zA-Z0-9_-]{11}$/)
    ],
    asyncWrapper(
        async (
            req: Request<
                {
                    id: string
                },
                {},
                { metadata: IYoutubeData }
            >,
            res: Response
        ) => {
            if (hasError(req, res)) return

            if (
                fs.existsSync(
                    `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${req.params.id}.mp4`
                )
            ) {
                clientError(res, 'Video already downloaded')
                return
            }

            const { pb } = req
            const { id } = req.params
            const { metadata } = req.body

            if (downloading === 'in_progress') {
                clientError(res, 'Already downloading')
                return
            }

            downloading = 'in_progress'
            res.status(202).json({
                state: 'accepted',
                message: 'Download started'
            })
            const downloadID = v4()

            if (!fs.existsSync('./downloads')) {
                fs.mkdirSync('./downloads')
            } else {
                fs.readdirSync('./downloads').forEach(file => {
                    fs.unlinkSync(`./downloads/${file}`)
                })
            }

            const output = `./downloads/${downloadID}.%(ext)s`

            await downloadVideo(
                `https://www.youtube.com/watch?v=${id}`,
                output,
                prog => {
                    progress = prog
                }
            )
                .then(async () => {
                    if (
                        !fs.existsSync(
                            `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos`
                        )
                    ) {
                        fs.mkdirSync(
                            `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos`
                        )
                    }

                    fs.renameSync(
                        `./downloads/${downloadID}.mp4`,
                        `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${id}.mp4`
                    )

                    fs.renameSync(
                        `./downloads/${downloadID}.webp`,
                        `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${id}.webp`
                    )

                    await pb.collection('youtube_video_storage_entry').create({
                        youtube_id: id,
                        title: metadata.title,
                        upload_date: moment(
                            metadata.uploadDate,
                            'YYYYMMDD'
                        ).toDate(),
                        uploader: metadata.uploader,
                        duration: +metadata.duration
                    })

                    downloading = 'completed'
                })
                .catch(() => {
                    downloading = 'failed'
                })
        }
    )
)

router.get(
    '/video/download-status',
    asyncWrapper(
        async (
            _: Request,
            res: Response<
                BaseResponse<{
                    status: 'empty' | 'in_progress' | 'completed' | 'failed'
                    progress: number
                }>
            >
        ) => {
            successWithBaseResponse(res, { status: downloading, progress })
        }
    )
)

router.delete(
    '/video/:id',
    param('id').isString(),
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { id } = req.params

        const record = await pb
            .collection('youtube_video_storage_entry')
            .getOne<IYoutubeVidesStorageEntry>(id)
        if (!record) {
            clientError(res, 'Video not found')
            return
        }

        fs.unlinkSync(
            `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${record.youtube_id}.mp4`
        )
        fs.unlinkSync(
            `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos/${record.youtube_id}.webp`
        )

        await pb.collection('youtube_video_storage_entry').delete(id)

        successWithBaseResponse(res)
    })
)

router.get('/playlist/get-info')

export default router
