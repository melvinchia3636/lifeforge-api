import { exec } from 'child_process'
import express, { Request, Response } from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (_: Request, res: Response) => {
        exec(
            'xvfb-run calibredb list --with-library ../calibre --for-machine -f cover,authors,title'
        ).stdout?.once('data', data => {
            const parsedData = JSON.parse(data)
            parsedData.forEach((item: any) => {
                item.cover = item.cover
                    .replace(process.env.CALIBRE_PATH, '')
                    .replace(/^\//, '')
                    .replace(/cover.jpg$/, '')
            })

            res.json({
                state: 'success',
                data: parsedData
            })
        })
    })
)

router.get(
    '/cover/:author/:book',
    asyncWrapper(async (req: Request, res: Response) => {
        const { author, book } = req.params
        console.log(
            `/home/pi/${
                process.env.DATABASE_OWNER
            }/calibre/${author}/${book}/cover.jpg`
        )
        res.sendFile(
            `/home/pi/${
                process.env.DATABASE_OWNER
            }/calibre/${author}/${book}/cover.jpg`
        )
    })
)

export default router
