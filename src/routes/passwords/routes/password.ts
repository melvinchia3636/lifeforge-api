import express, { Request, Response } from 'express'
import { v4 } from 'uuid'
import bcrypt from 'bcrypt'
import { clientError, success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import {
    decrypt,
    decrypt2,
    encrypt,
    encrypt2
} from '../../../utils/encryption.js'
import { body, query } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

let challenge = v4()

setTimeout(() => {
    challenge = v4()
}, 1000 * 60)

router.get(
    '/challenge',
    asyncWrapper(async (req: Request, res: Response) => {
        success(res, challenge)
    })
)

router.get(
    '/decrypt/:id',
    [query('master').notEmpty(), query('user').notEmpty()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { id } = req.params
        const { master, user: userId } = req.query
        const { pb } = req

        if (!master) {
            clientError(res, 'master is required')
            return
        }

        const user = await pb.collection('users').getOne(userId)
        const { masterPasswordHash } = user

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            masterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const password = await pb.collection('passwords_entries').getOne(id)

        const decryptedPassword = decrypt(
            Buffer.from(password.password, 'base64'),
            decryptedMaster
        )

        const encryptedPassword = encrypt2(
            decryptedPassword.toString(),
            challenge
        )

        success(res, encryptedPassword)
    })
)

router.get(
    '/',
    asyncWrapper(async (req: Request, res: Response) =>
        list(req, res, 'passwords_entries', {
            sort: '-pinned'
        })
    )
)

router.post(
    '/',
    [
        body('userId').notEmpty(),
        body('name').notEmpty(),
        body('icon').notEmpty(),
        body('color').isHexColor(),
        body('website').notEmpty(),
        body('username').notEmpty(),
        body('password').notEmpty(),
        body('master').notEmpty()
    ],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const {
            userId,
            name,
            icon,
            color,
            website,
            username,
            password,
            master
        } = req.body
        const { pb } = req

        const user = await pb.collection('users').getOne(userId)
        const { masterPasswordHash } = user

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            masterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const decryptedPassword = decrypt2(password, challenge)
        const encryptedPassword = encrypt(
            Buffer.from(decryptedPassword),
            decryptedMaster
        )

        await pb.collection('passwords_entries').create({
            name,
            icon,
            color,
            website,
            username,
            password: encryptedPassword.toString('base64')
        })

        success(res)
    })
)

router.patch(
    '/:id',
    [
        body('userId').notEmpty(),
        body('name').notEmpty(),
        body('icon').notEmpty(),
        body('color').isHexColor(),
        body('website').notEmpty(),
        body('username').notEmpty(),
        body('password').notEmpty(),
        body('master').notEmpty()
    ],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return
        const { id } = req.params
        const {
            userId,
            name,
            icon,
            color,
            website,
            username,
            password,
            master
        } = req.body
        const { pb } = req

        const user = await pb.collection('users').getOne(userId)
        const { masterPasswordHash } = user

        const decryptedMaster = decrypt2(master, challenge)

        const isMatch = await bcrypt.compare(
            decryptedMaster,
            masterPasswordHash
        )

        if (!isMatch) {
            clientError(res, 'Invalid master password')
            return
        }

        const decryptedPassword = decrypt2(password, challenge)
        const encryptedPassword = encrypt(
            Buffer.from(decryptedPassword),
            decryptedMaster
        )

        await pb.collection('passwords_entries').update(id, {
            name,
            icon,
            color,
            website,
            username,
            password: encryptedPassword.toString('base64')
        })

        success(res)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { id } = req.params

        const { pb } = req

        await pb.collection('passwords_entries').delete(id)

        success(res)
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

        success(res)
    })
)

export default router
