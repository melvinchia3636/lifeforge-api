import express from 'express'
import event from './routes/event.js'
import category from './routes/category.js'

const router = express.Router()

router.use('/event', event)
router.use('/category', category)

export default router
