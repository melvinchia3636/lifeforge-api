import express, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import { successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { decrypt2 } from '../../../utils/encryption.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { BaseResponse } from '../../../interfaces/base_response.js'

const router = express.Router()

let challenge = v4()

setTimeout(() => {
    challenge = v4()
}, 1000 * 60)

router.get(
    '/challenge',
    asyncWrapper(async (_: Request, res: Response<BaseResponse<string>>) => {
        successWithBaseResponse(res, challenge)
    })
)

router.post(
    '/',
    [body('id').exists().notEmpty(), body('password').exists().notEmpty()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { id, password } = req.body
        const { pb } = req

        const salt = await bcrypt.genSalt(10)
        const masterPasswordHash = await bcrypt.hash(password, salt)

        await pb.collection('users').update(id, {
            masterPasswordHash
        })

        successWithBaseResponse(res)
    })
)

router.post(
    '/verify',
    asyncWrapper(async (req: Request, res: Response<BaseResponse<boolean>>) => {
        const { id, password } = req.body
        const { pb } = req

        const decryptedMaster = decrypt2(password, challenge)

        const user = await pb.collection('users').getOne(id)
        const { masterPasswordHash } = user

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            masterPasswordHash
        )

        successWithBaseResponse(res, isMatch)
    })
)

export default router
