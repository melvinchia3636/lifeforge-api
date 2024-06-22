import express from 'express'
import entryRoutes from './routes/entry.js'
import kanbanRoutes from './routes/kanban/index.js'
import categoryRoutes from './routes/category.js'
import statusRoutes from './routes/status.js'
import visibilityRoutes from './routes/visibility.js'
import technologyRoutes from './routes/technology.js'

const router = express.Router()

router.use('/entry', entryRoutes)
router.use('/kanban', kanbanRoutes)
router.use('/category', categoryRoutes)
router.use('/status', statusRoutes)
router.use('/visibility', visibilityRoutes)
router.use('/technology', technologyRoutes)

export default router
