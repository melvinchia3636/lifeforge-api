import express from 'express'
import entry from './routes/entry.js'

const router = express.Router()

router.use('/entry', entry)

export default router
