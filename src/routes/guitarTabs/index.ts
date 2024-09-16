import express, { Request, Response } from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import pdfThumbnail from 'pdf-thumbnail'
// @ts-expect-error no type for this
import pdfPageCounter from 'pdf-page-counter'
import fs from 'fs'
import {
    clientError,
    success,
    successWithBaseResponse
} from '../../utils/response.js'
import { uploadMiddleware } from '../../middleware/uploadMiddleware.js'
import { BaseResponse } from '../../interfaces/base_response.js'
import {
    IGuitarTabsEntry,
    IGuitarTabsSidebarData
} from '../../interfaces/guitar_tabs_interfaces.js'
import { ListResult } from 'pocketbase'
import moment from 'moment'

const router = express.Router()

let processing = 'empty'
let left = 0
let total = 0

router.get(
    '/sidebar-data',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IGuitarTabsSidebarData>>
        ) => {
            const { pb } = req

            const allScores = await pb
                .collection('guitar_tabs_entries')
                .getFullList<IGuitarTabsEntry>()

            const data: IGuitarTabsSidebarData = {
                total: allScores.length,
                favourites: allScores.filter(entry => entry.isFavourite).length,
                fingerstyle: allScores.filter(
                    entry => entry.type === 'fingerstyle'
                ).length,
                singalong: allScores.filter(entry => entry.type === 'singalong')
                    .length,
                authors: allScores.reduce(
                    (acc, entry) => {
                        if (!acc[entry.author]) {
                            acc[entry.author] = 0
                        }
                        acc[entry.author]++
                        return acc
                    },
                    {} as Record<string, number>
                )
            }

            successWithBaseResponse(res, data)
        }
    )
)

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
                    category: string
                    author: string
                    starred: boolean
                }
            >,
            res: Response<BaseResponse<ListResult<IGuitarTabsEntry[]>>>
        ) => {
            const { pb } = req
            const page = req.query.page || 1
            const search = decodeURIComponent(req.query.query || '')

            const category =
                req.query.category === 'all' ? '' : req.query.category
            const author = req.query.author === 'all' ? '' : req.query.author
            const starred = req.query.starred

            const entries = await pb
                .collection('guitar_tabs_entries')
                .getList<IGuitarTabsEntry[]>(page, 20, {
                    filter: `(name~"${search}" || author~"${search}") && type~"${category}" && author~"${author}" && isFavourite=${starred}`,
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

            if (!extension || !['mscz', 'mp3', 'pdf'].includes(extension))
                continue

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
            if (group.pdf) continue

            for (const file of Object.values(group)) {
                if (!file) continue

                fs.unlinkSync(file.path)
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

router.get(
    '/download-all',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const entries = await pb
            .collection('guitar_tabs_entries')
            .getFullList<IGuitarTabsEntry>()

        let mediumLocation = `/home/pi/${process.env.DATABASE_OWNER}/medium`
        const date = moment().format('YYYY-MM-DD')
        if (!fs.existsSync(`${mediumLocation}/guitar_tabs-${date}`)) {
            fs.mkdirSync(`${mediumLocation}/guitar_tabs-${date}`)
            mediumLocation = `${mediumLocation}/guitar_tabs-${date}`
        } else {
            let i = 1
            while (
                fs.existsSync(`${mediumLocation}/guitar_tabs-${date}-${i}`)
            ) {
                i++
            }
            fs.mkdirSync(`${mediumLocation}/guitar_tabs-${date}-${i}`)
            mediumLocation = `${mediumLocation}/guitar_tabs-${date}-${i}`
        }

        for (const entry of entries) {
            let targetLocation = mediumLocation
            const folderLocation = `/home/pi/${process.env.DATABASE_OWNER}/database/pb_data/storage/${entry.collectionId}/${entry.id}`

            if (entry.audio || entry.musescore) {
                fs.mkdirSync(`${mediumLocation}/${entry.name}`)
                targetLocation = `${mediumLocation}/${entry.name}`
            }

            fs.copyFileSync(
                `${folderLocation}/${entry.pdf}`,
                `${targetLocation}/${entry.name}.pdf`
            )
            if (entry.audio) {
                fs.copyFileSync(
                    `${folderLocation}/${entry.audio}`,
                    `${targetLocation}/${entry.name}.${entry.audio.split('.').pop()}`
                )
            }
            if (entry.musescore) {
                fs.copyFileSync(
                    `${folderLocation}/${entry.musescore}`,
                    `${targetLocation}/${entry.name}.${entry.musescore.split('.').pop()}`
                )
            }
        }

        success(res)
    })
)

export default router
