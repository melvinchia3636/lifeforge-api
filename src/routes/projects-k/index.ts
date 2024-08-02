import express, { Request, Response } from 'express'
import entries from './routes/entries.js'
import progress from './routes/progresses.js'
import files from './routes/files.js'
import { success } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'

const router = express.Router()

router.use('/entries', entries)
router.use('/progress', progress)
router.use('/files', files)

router.get(
    '/ip',
    asyncWrapper(async (req: Request, res: Response) => {
        // @ts-expect-error no type for this
        import('node-public-ip').then(async ({ publicIp }) => {
            const ip = await publicIp()
            success(res, ip)
        })
    })
)

export default router
