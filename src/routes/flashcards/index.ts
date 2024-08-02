import express, { Request, Response } from 'express'
import tagRoutes from './routes/tag.js'
import deckRoutes from './routes/deck.js'
import cardRoutes from './routes/card.js'

const router = express.Router()

router.use('/tag', tagRoutes)
router.use('/deck', deckRoutes)
router.use('/card', cardRoutes)

export default router
