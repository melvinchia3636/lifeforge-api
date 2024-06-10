import express from 'express'
import labelRoutes from './routes/label.js'
import languageRoutes from './routes/language.js'
import entryRoutes from './routes/entry.js'

const router = express.Router()

router.use('/label', labelRoutes)
router.use('/language', languageRoutes)
router.use('/entry', entryRoutes)

export default router
