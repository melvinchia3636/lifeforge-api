import express from 'express'
import youtube from './routes/youtube.js'
import entry from './routes/entry.js'

const router = express.Router()

router.use('/entry', entry)
router.use('/youtube', youtube)

export default router
