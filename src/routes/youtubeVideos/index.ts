import express from 'express'
import videoRoutes from './routes/video.js'
import playlistRoutes from './routes/playlist.js'

const router = express.Router()

router.use('/video', videoRoutes)
router.use('/playlist', playlistRoutes)

export default router
