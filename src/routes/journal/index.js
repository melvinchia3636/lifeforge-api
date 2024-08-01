import express from 'express'
import auth from './routes/auth.js'
import entries from './routes/entries.js'
import { v4 } from 'uuid'

const router = express.Router()

export let challenge = v4()

setTimeout(() => {
    challenge = v4()
}, 1000 * 60)

router.use('/entries', entries)
router.use('/auth', auth)

export default router
