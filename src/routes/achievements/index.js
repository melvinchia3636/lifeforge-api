import express from 'express'
import entryRoutes from './routes/entry.js'

const router = express.Router()

router.use('/entry', entryRoutes)

export default router
