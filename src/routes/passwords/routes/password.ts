import express, { Request, Response } from 'express'
import { v4 } from 'uuid'
import bcrypt from 'bcrypt'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import {
    decrypt,
    decrypt2,
    encrypt,
    encrypt2
} from '../../../utils/encryption.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IPasswordEntry } from '../../../interfaces/password_interfaces.js'

const router = express.Router()

let challenge = v4()

setTimeout(() => {
    challenge = v4()
}, 1000 * 60)

async function getDecryptedMaster(
    req: Request,
    res: Response
): Promise<string | null> {
    const { master } = req.body

    const { pb } = req

    if (!pb.authStore.model) {
        clientError(res, 'Auth store not initialized')
        return null
    }

    const { masterPasswordHash } = pb.authStore.model
    const decryptedMaster = decrypt2(master, challenge)
    const isMatch = await bcrypt.compare(decryptedMaster, masterPasswordHash)

    if (!isMatch) {
        clientError(res, 'Invalid master password')
        return null
    }

    return decryptedMaster
}

router.get(
    '/challenge',
    asyncWrapper(async (_: Request, res: Response<BaseResponse<string>>) => {
        successWithBaseResponse(res, challenge)
    })
)

router.post(
    '/decrypt/:id',
    [body('master').notEmpty()],
    asyncWrapper(async (req: Request, res: Response<BaseResponse<string>>) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { id } = req.params

        const decryptedMaster = await getDecryptedMaster(req, res)
        if (!decryptedMaster) return

        const password: IPasswordEntry = await pb
            .collection('passwords_entries')
            .getOne(id)

        const decryptedPassword = decrypt(
            Buffer.from(password.password, 'base64'),
            decryptedMaster
        )

        const encryptedPassword = encrypt2(
            decryptedPassword.toString(),
            challenge
        )

        successWithBaseResponse(res, encryptedPassword)
    })
)

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IPasswordEntry[]>>) =>
            list(req, res, 'passwords_entries', {
                sort: '-pinned'
            })
    )
)

router.post(
    '/',
    [
        body('name').notEmpty(),
        body('icon').notEmpty(),
        body('color').isHexColor(),
        body('website').notEmpty(),
        body('username').notEmpty(),
        body('password').notEmpty(),
        body('master').notEmpty()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IPasswordEntry>>) => {
            if (hasError(req, res)) return

            const { name, icon, color, website, username, password } = req.body
            const { pb } = req

            if (!pb.authStore.model) {
                clientError(res, 'Auth store not initialized')
                return
            }

            const decryptedMaster = await getDecryptedMaster(req, res)
            if (!decryptedMaster) return

            const decryptedPassword = decrypt2(password, challenge)
            const encryptedPassword = encrypt(
                Buffer.from(decryptedPassword),
                decryptedMaster
            )

            const entry: IPasswordEntry = await pb
                .collection('passwords_entries')
                .create({
                    name,
                    icon,
                    color,
                    website,
                    username,
                    password: encryptedPassword.toString('base64')
                })

            successWithBaseResponse(res, entry)
        }
    )
)

router.patch(
    '/:id',
    [
        body('name').notEmpty(),
        body('icon').notEmpty(),
        body('color').isHexColor(),
        body('website').notEmpty(),
        body('username').notEmpty(),
        body('password').notEmpty(),
        body('master').notEmpty()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IPasswordEntry>>) => {
            if (hasError(req, res)) return
            const { id } = req.params
            const { name, icon, color, website, username, password } = req.body
            const { pb } = req

            const decryptedMaster = await getDecryptedMaster(req, res)
            if (!decryptedMaster) return

            const decryptedPassword = decrypt2(password, challenge)
            const encryptedPassword = encrypt(
                Buffer.from(decryptedPassword),
                decryptedMaster
            )

            const entry: IPasswordEntry = await pb
                .collection('passwords_entries')
                .update(id, {
                    name,
                    icon,
                    color,
                    website,
                    username,
                    password: encryptedPassword.toString('base64')
                })

            successWithBaseResponse(res, entry)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { id } = req.params

        const { pb } = req

        await pb.collection('passwords_entries').delete(id)

        successWithBaseResponse(res)
    })
)

router.post(
    '/pin/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { id } = req.params
        const { pb } = req

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const password = await pb.collection('passwords_entries').getOne(id)
        await pb.collection('passwords_entries').update(id, {
            pinned: !password.pinned
        })

        successWithBaseResponse(res)
    })
)

export default router
