import express, { Request, Response } from 'express'
import columnRoutes from './routes/columns.js'

const router = express.Router()

router.use('/column', columnRoutes)

export default router
