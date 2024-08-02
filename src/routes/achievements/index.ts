import express from 'express'
import entriesRoutes from './routes/entries.js'

const router = express.Router()

router.use('/entries', entriesRoutes)

export default router
