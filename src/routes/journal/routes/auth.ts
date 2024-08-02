import express, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { decrypt2 } from '../../../utils/encryption.js'
import { body } from 'express-validator'
import { challenge } from '../index.js'
import hasError from '../../../utils/checkError.js'
import { BaseResponse } from '../../../interfaces/base_response.js'

const router = express.Router()

router.get(
    '/challenge',
    asyncWrapper(async (_: Request, res: Response<string>) => {
        success(res, challenge)
    })
)

router.post(
    '/',
    [body('id').exists().notEmpty(), body('password').exists().notEmpty()],
    asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
        if (hasError(req, res)) return

        const { id, password } = req.body
        const { pb } = req

        const salt = await bcrypt.genSalt(10)
        const journalMasterPasswordHash = await bcrypt.hash(password, salt)

        await pb.collection('users').update(id, {
            journalMasterPasswordHash
        })

        success(res)
    })
)

router.post(
    '/verify',
    asyncWrapper(async (req: Request, res: Response<boolean>) => {
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
