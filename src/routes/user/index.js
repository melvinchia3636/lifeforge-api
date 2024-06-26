import fs from 'fs'
import express from 'express'
import passkey from './routes/passkey.js'
import Pocketbase from 'pocketbase'
import { clientError, success } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { singleUploadMiddleware } from '../../middleware/uploadMiddleware.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.use('/passkey', passkey)

router.post(
    '/auth/login',
    asyncWrapper(async (req, res) => {
        const { email, password } = req.body
        const pb = new Pocketbase(process.env.PB_HOST)

        let failed = false

        await pb
            .collection('users')
            .authWithPassword(email, password)
            .catch(() => {
                failed = true
            })

        if (pb.authStore.isValid && !failed) {
            const userData = pb.authStore.model

            for (let key in userData) {
                if (key.includes('webauthn')) {
                    delete userData[key]
                }
            }

            userData.hasMasterPassword = Boolean(userData.masterPasswordHash)
            userData.hasJournalMasterPassword = Boolean(
                userData.journalMasterPasswordHash
            )
            delete userData['masterPasswordHash']
            delete userData['journalMasterPasswordHash']

            res.json({
                state: 'success',
                token: pb.authStore.token,
                userData
            })
        } else {
            res.status(401).send({
                state: 'error',
                message: 'Invalid credentials'
            })
        }
    })
)

router.post(
    '/auth/verify',
    asyncWrapper(async (req, res) => {
        const bearerToken = req.headers.authorization?.split(' ')[1]
        const pb = new Pocketbase(process.env.PB_HOST)

        pb.authStore.save(bearerToken, null)
        await pb.collection('users').authRefresh()

        if (pb.authStore.isValid) {
            const userData = pb.authStore.model

            for (let key in userData) {
                if (key.includes('webauthn')) {
                    delete userData[key]
                }
            }

            userData.hasMasterPassword = Boolean(userData.masterPasswordHash)
            userData.hasJournalMasterPassword = Boolean(
                userData.journalMasterPasswordHash
            )
            delete userData['masterPasswordHash']
            delete userData['journalMasterPasswordHash']

            res.json({
                state: 'success',
                token: pb.authStore.token,
                userData
            })
        }
    })
)

router.patch(
    '/module',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id, data } = req.body
        await pb.collection('users').update(id, {
            enabledModules: data
        })

        success(res)
    })
)

router.put(
    '/module/config',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id, data } = req.body
        await pb.collection('users').update(id, {
            moduleConfigs: data
        })

        success(res)
    })
)

router.patch(
    '/personalization',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id, data } = req.body
        const toBeUpdated = {}

        for (let item of [
            'theme',
            'color',
            'bgTemp',
            'language',
            'dashboardLayout'
        ]) {
            if (data[item]) {
                toBeUpdated[item] = data[item]
            }
        }

        if (!Object.keys(toBeUpdated).length) {
            throw new Error('No data to update')
        }

        await pb.collection('users').update(id, toBeUpdated)

        success(res)
    })
)

router.put(
    '/settings/avatar',
    singleUploadMiddleware,
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const file = req.file

        if (!file) {
            throw new Error('No file uploaded')
        }

        const id = pb.authStore.model.id

        const fileBuffer = fs.readFileSync(file.path)

        const newRecord = await pb.collection('users').update(id, {
            avatar: new File(
                [fileBuffer],
                `${id}.${file.originalname.split('.').pop()}`
            )
        })

        fs.unlinkSync(file.path)

        success(res, newRecord.avatar)
    })
)

router.delete(
    '/settings/avatar',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const id = pb.authStore.model.id

        const newRecord = await pb.collection('users').update(id, {
            avatar: null
        })

        success(res, newRecord.avatar)
    })
)

router.patch(
    '/settings',
    [
        body('data.username').optional().isAlphanumeric(),
        body('data.email').optional().isEmail(),
        body('data.name').optional().isString()
    ],
    asyncWrapper(async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            clientError(res, result.array())
            return
        }

        const { pb } = req
        const id = pb.authStore.model.id
        const { data } = req.body

        if (data.email) {
            await pb.collection('users').requestEmailChange(data.email)
        }

        const newData = {}

        if (data.username) newData.username = data.username
        if (data.name) newData.name = data.name

        await pb.collection('users').update(id, newData)

        success(res)
    })
)

router.post(
    '/settings/request-password-reset',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        await pb
            .collection('users')
            .requestPasswordReset(pb.authStore.model.email)

        success(res)
    })
)

export default router
