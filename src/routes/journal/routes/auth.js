import express from 'express'
import bcrypt from 'bcrypt'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { decrypt2 } from '../../../utils/encryption.js'
import { body, validationResult } from 'express-validator'
import { challenge } from '../index.js'

const router = express.Router()

router.get(
    '/challenge',
    asyncWrapper(async (req, res) => {
        success(res, challenge)
    })
)

router.post(
    '/',
    [body('id').exists().notEmpty(), body('password').exists().notEmpty()],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return clientError(res, result.array())
        }

        const { id, password } = req.body
        const { pb } = req

        const salt = await bcrypt.genSalt(10)
        const journalMasterPasswordHash = await bcrypt.hash(password, salt)

        await pb.collection('users').update(id, {
            journalMasterPasswordHash
        })

        res.json({
            state: 'success'
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
        const { journalMasterPasswordHash } = user

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            journalMasterPasswordHash
        )

        success(res, isMatch)
    })
)

export default router
