import express from 'express'
import entriesRoutes from './routes/entries.js'
import subtasksRoutes from './routes/subtasks.js'
import prioritiesRoutes from './routes/priorities.js'
import listsRoutes from './routes/lists.js'
import tagsRoutes from './routes/tags.js'

const router = express.Router()

router.use('/entries', entriesRoutes)
router.use('/subtasks', subtasksRoutes)
router.use('/priorities', prioritiesRoutes)
router.use('/lists', listsRoutes)
router.use('/tags', tagsRoutes)

export default router
