import express, { Request, Response } from 'express'
import youtube from './routes/youtube.js'
import entries from './routes/entries.js'

const router = express.Router()

router.use('/entries', entries)
router.use('/youtube', youtube)

export default router
