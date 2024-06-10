import express from 'express'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { decrypt2 } from '../../../utils/encryption.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

let challenge = v4()

setTimeout(() => {
    challenge = v4()
}, 1000 * 60)

router.get(
    '/challenge',
    asyncWrapper(async (req, res) => {
        success(res, challenge)
    })
)

router.post(
    '/create',
    [body('id').exists().notEmpty(), body('password').exists().notEmpty()],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return clientError(res, result.array())
        }

        const { id, password } = req.body
        const { pb } = req

        const salt = await bcrypt.genSalt(10)
        const masterPasswordHash = await bcrypt.hash(password, salt)

        await pb.collection('users').update(id, {
            masterPasswordHash
        })

        res.json({
            state: 'success',
            hash: masterPasswordHash
        })
    })
)

router.post(
    '/verify',
    asyncWrapper(async (req, res) => {
        const { id, password } = req.body
        const { pb } = req

        const decryptedMaster = decrypt2(password, challenge)

        const user = await pb.collection('users').getOne(id)
        const { masterPasswordHash } = user

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            masterPasswordHash
        )

        success(res, isMatch)
    })
)

export default router
