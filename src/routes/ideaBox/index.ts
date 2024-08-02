import express, { Request, Response } from 'express'
import container from './routes/container.js'
import folder from './routes/folder.js'
import idea from './routes/idea.js'

const router = express.Router()

router.use('/container', container)
router.use('/folder', folder)
router.use('/idea', idea)

export default router
