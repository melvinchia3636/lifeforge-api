import express, { Request, Response } from 'express'
import workspaceRoutes from './routes/workspaces.js'
import subjectRoutes from './routes/subjects.js'
import entriesRoutes from './routes/entries.js'

const router = express.Router()

router.use('/workspace', workspaceRoutes)
router.use('/subject', subjectRoutes)
router.use('/entries', entriesRoutes)

export default router
