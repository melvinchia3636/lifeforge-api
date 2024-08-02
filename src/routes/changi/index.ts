import express, { Request, Response } from 'express'
import flightsRoutes from './routes/flights.js'

const router = express.Router()

router.use('/flights', flightsRoutes)

export default router
