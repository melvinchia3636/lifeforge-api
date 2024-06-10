import express from 'express'
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

router.get(
    '/decrypt/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params
        const { master, user: userId } = req.query
        const { pb } = req

        if (!master) {
            clientError(res, 'master is required')
            return
        }

        if (!id) {
            clientError(res, 'id is required')
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

        const password = await pb.collection('passwords_entry').getOne(id)

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
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const passwords = await pb.collection('passwords_entry').getFullList({
            sort: '-pinned'
        })

        success(res, passwords)
    })
)

router.post(
    '/create',
    asyncWrapper(async (req, res) => {
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

        if (
            !userId ||
            !name ||
            !icon ||
            !color ||
            !website ||
            !username ||
            !password ||
            !master
        ) {
            clientError(res, 'Missing required fields')
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

        const decryptedPassword = decrypt2(password, challenge)
        const encryptedPassword = encrypt(
            Buffer.from(decryptedPassword),
            decryptedMaster
        )

        await pb.collection('passwords_entry').create({
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
    '/update/:id',
    asyncWrapper(async (req, res) => {
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

        if (
            !userId ||
            !name ||
            !icon ||
            !color ||
            !website ||
            !username ||
            !password ||
            !master
        ) {
            clientError(res, 'Missing required fields')
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

        const decryptedPassword = decrypt2(password, challenge)
        const encryptedPassword = encrypt(
            Buffer.from(decryptedPassword),
            decryptedMaster
        )

        await pb.collection('passwords_entry').update(id, {
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
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const { pb } = req

        await pb.collection('passwords_entry').delete(id)

        success(res)
    })
)

router.post(
    '/pin/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params
        const { pb } = req

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const password = await pb.collection('passwords_entry').getOne(id)
        await pb.collection('passwords_entry').update(id, {
            pinned: !password.pinned
        })

        success(res)
    })
)

export default router
