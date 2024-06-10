import express from 'express'
import entry from './routes/entry.js'
import progress from './routes/progress.js'
import files from './routes/files.js'
import { success } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'

const router = express.Router()

router.use('/entry', entry)
router.use('/progress', progress)
router.use('/files', files)

router.get(
    '/ip',
    asyncWrapper(async (req, res) => {
        import('node-public-ip').then(async ({ publicIp }) => {
            const ip = await publicIp()
            success(res, ip)
        })
    })
)

export default router
