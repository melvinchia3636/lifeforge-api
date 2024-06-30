import express from 'express'
import auth from './routes/auth.js'
import entry from './routes/entry.js'
import { v4 } from 'uuid'

const router = express.Router()

export let challenge = v4()

setTimeout(() => {
    challenge = v4()
}, 1000 * 60)

router.use('/entry', entry)
router.use('/auth', auth)

export default router
