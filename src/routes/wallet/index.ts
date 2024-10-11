import express, { Request, Response } from 'express'
import transactionsRoutes from './routes/transactions.js'
import categoryRoutes from './routes/category.js'
import assetsRoutes from './routes/assets.js'
import ledgersRoutes from './routes/ledgers.js'

const router = express.Router()

router.use('/transactions', transactionsRoutes)
router.use('/categories', categoryRoutes)
router.use('/assets', assetsRoutes)
router.use('/ledgers', ledgersRoutes)

export default router
