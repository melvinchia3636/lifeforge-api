import express, { Request, Response } from 'express'
import { success, successWithBaseResponse } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { challenge } from '../index.js'
import { body } from 'express-validator'
import { BaseResponse } from '../../../interfaces/base_response.js'
import hasError from '../../../utils/checkError.js'
import { decrypt2 } from '../../../utils/encryption.js'
import bcrypt from 'bcrypt'

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
        const APIKeysMasterPasswordHash = await bcrypt.hash(password, salt)

        await pb.collection('users').update(id, {
            APIKeysMasterPasswordHash
        })

        successWithBaseResponse(res)
    })
)

router.post(
    '/verify',
    asyncWrapper(async (req: Request, res: Response<boolean>) => {
        const { pb } = req
        const { password } = req.body
        const id = pb.authStore.model?.id

        if (!id) {
            success(res, false)
            return
        }

        const decryptedMaster = decrypt2(password, challenge)

        const user = await pb.collection('users').getOne(id)
        const { APIKeysMasterPasswordHash } = user

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            APIKeysMasterPasswordHash
        )

        success(res, isMatch)
    })
)

router.post(
    '/otp',
    [body('otp').exists().notEmpty()],
    asyncWrapper(async (req: Request, res: Response<BaseResponse<boolean>>) => {
        if (hasError(req, res)) return

        const { otp } = req.body
        const { pb } = req
        const id = pb.authStore.model?.id

        if (!id) {
            successWithBaseResponse(res, false)
            return
        }

        const decryptedOTP = decrypt2(otp, challenge)
        const storedOTP = pb.authStore.model?.otp

        if (!storedOTP) {
            successWithBaseResponse(res, false)
            return
        }

        const [OTPKey, OTPExpire] = storedOTP.split('.')
        const expire = new Date(OTPExpire)
        const now = new Date()

        if (now > expire || decryptedOTP !== OTPKey) {
            successWithBaseResponse(res, false)
            return
        }

        await pb.collection('users').update(id, {
            otp: ''
        })

        successWithBaseResponse(res, true)
    })
)

export default router
