import express, { Request, Response } from 'express'
import entriesRoutes from './routes/entries.js'
import kanbanRoutes from './routes/kanban/index.js'
import categoryRoutes from './routes/categories.js'
import statusRoutes from './routes/statuses.js'
import visibilityRoutes from './routes/visibilities.js'
import technologyRoutes from './routes/technologies.js'

const router = express.Router()

router.use('/entries', entriesRoutes)
router.use('/kanban', kanbanRoutes)
router.use('/categories', categoryRoutes)
router.use('/statuses', statusRoutes)
router.use('/visibilities', visibilityRoutes)
router.use('/technologies', technologyRoutes)

export default router
