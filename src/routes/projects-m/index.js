import express from 'express'
import entriesRoutes from './routes/entries.js'
import kanbanRoutes from './routes/kanban/index.js'
import categoryRoutes from './routes/categories.js'
import statusRoutes from './routes/statuses.js'
import visibilityRoutes from './routes/visibilities.js'
import technologyRoutes from './routes/technologies.js'

const router = express.Router()

router.use('/entries', entriesRoutes)
router.use('/kanban', kanbanRoutes)
router.use('/category', categoryRoutes)
router.use('/status', statusRoutes)
router.use('/visibility', visibilityRoutes)
router.use('/technology', technologyRoutes)

export default router
