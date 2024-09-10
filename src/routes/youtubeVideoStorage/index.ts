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
import { body, param, query } from 'express-validator'
import { v4 } from 'uuid'
import hasError from '../../utils/checkError.js'
import fs from 'fs'
import moment from 'moment'
import { list } from '../../utils/CRUD.js'
import {
    IYoutubePlaylistEntry,
    IYoutubeVidesStorageEntry
} from '../../interfaces/youtube_video_storage_interfaces.js'
//@ts-expect-error no type available
import getDimensions from 'get-video-dimensions'

const VIDEO_STORAGE_PATH = `/home/pi/${process.env.DATABASE_OWNER}/youtubeVideos`

const router = express.Router()

const processes = new Map<
    string,
    {
        status: 'in_progress' | 'completed' | 'failed'
        progress: number
    }
>()

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

function getPlaylist(url: string): Promise<IYoutubePlaylistEntry> {
    return new Promise((resolve, reject) => {
        exec(
            `${process.cwd()}/src/bin/yt-dlp --flat-playlist --dump-single-json ${url}`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`)
                    reject(error)
                }

                try {
                    const playlist = JSON.parse(stdout)
                    const final = {
                        title: playlist.title,
                        total_videos: playlist.entries.length,
                        thumbnail:
                            playlist.thumbnails[playlist.thumbnails.length - 1]
                                .url,
                        views: playlist.view_count,
                        channel: playlist.channel,
                        entries: playlist.entries.map((e: any) => ({
                            id: e.id,
                            title: e.title,
                            duration: e.duration,
                            uploader: e.uploader,
                            thumbnail:
                                e.thumbnails[e.thumbnails.length - 1].url,
                            viewCount: e.view_count
                        }))
                    }
                    resolve(final)
                } catch (err) {
                    console.error(`Error parsing JSON: ${err}`)
                    reject(err)
                }
            }
        )
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

            if (
                processes.has(id) &&
                processes.get(id)?.status === 'in_progress'
            ) {
                clientError(res, 'Download already in progress')
                return
            }

            // Remove any redundant processes that are either completed or failed
            processes.forEach((value, key) => {
                if (value.status !== 'in_progress') {
                    processes.delete(key)
                }
            })

            processes.set(id, {
                status: 'in_progress',
                progress: 0
            })

            res.status(202).json({
                state: 'accepted',
                message: 'Download started'
            })

            if (!fs.existsSync('./downloads')) {
                fs.mkdirSync('./downloads')
            }

            const output = `./downloads/${id}.%(ext)s`

            await downloadVideo(
                `https://www.youtube.com/watch?v=${id}`,
                output,
                prog => {
                    processes.set(id, {
                        status: 'in_progress',
                        progress: prog
                    })
                }
            )
                .then(async () => {
                    if (!fs.existsSync(VIDEO_STORAGE_PATH)) {
                        fs.mkdirSync(VIDEO_STORAGE_PATH)
                    }

                    fs.renameSync(
                        `./downloads/${id}.mp4`,
                        `${VIDEO_STORAGE_PATH}/${id}.mp4`
                    )

                    fs.renameSync(
                        `./downloads/${id}.webp`,
                        `${VIDEO_STORAGE_PATH}/${id}.webp`
                    )

                    const { width, height } = await getDimensions(
                        `${VIDEO_STORAGE_PATH}/${id}.mp4`
                    )

                    const fileSize = fs.statSync(
                        `${VIDEO_STORAGE_PATH}/${id}.mp4`
                    ).size

                    await pb.collection('youtube_video_storage_entry').create({
                        youtube_id: id,
                        title: metadata.title,
                        upload_date: moment(
                            metadata.uploadDate,
                            'YYYYMMDD'
                        ).toDate(),
                        uploader: metadata.uploader,
                        duration: +metadata.duration,
                        width,
                        height,
                        filesize: fileSize
                    })

                    processes.set(id, {
                        status: 'completed',
                        progress: 100
                    })
                })
                .catch(() => {
                    processes.set(id, {
                        status: 'failed',
                        progress: 0
                    })
                })
        }
    )
)

router.post(
    '/video/download-status',
    body('id').custom(id => {
        return id.every((i: string) => i.match(/^[a-zA-Z0-9_-]{11}$/))
    }),
    asyncWrapper(
        async (
            req: Request,
            res: Response<
                BaseResponse<
                    | {
                          status: 'in_progress' | 'completed' | 'failed'
                          progress: number
                      }
                    | Record<
                          string,
                          {
                              status: 'in_progress' | 'completed' | 'failed'
                              progress: number
                          }
                      >
                >
            >
        ) => {
            if (hasError(req, res)) return

            const { id } = req.body

            const response = Object.entries(
                Object.fromEntries(processes)
            ).filter(([key]) => id.includes(key))

            successWithBaseResponse(res, Object.fromEntries(response))
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

router.get(
    '/playlist/get-info/:id',
    param('id').isString(),
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { id } = req.params

        await getPlaylist(`https://www.youtube.com/playlist?list=${id}`)
            .then(playlist => {
                successWithBaseResponse(res, playlist)
            })
            .catch(() => {
                serverError(res, 'Error fetching playlist')
            })
    })
)

export default router
