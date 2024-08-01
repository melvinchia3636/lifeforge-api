import express from 'express'
import entries from './routes/entries.js'
import subtask from './routes/subtasks.js'
import list from './routes/lists.js'
import tag from './routes/tags.js'

const router = express.Router()

router.use('/entries', entries)
router.use('/subtask', subtask)
router.use('/list', list)
router.use('/tag', tag)

export default router
