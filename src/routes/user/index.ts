import fs from 'fs'
import express, { Request, Response } from 'express'
import Pocketbase from 'pocketbase'
import { clientError, successWithBaseResponse } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { singleUploadMiddleware } from '../../middleware/uploadMiddleware.js'
import { body } from 'express-validator'
import hasError from '../../utils/checkError.js'
import { query } from 'express-validator'
import { v4 } from 'uuid'

const router = express.Router()

let currentCodeVerifier: string | null = null

function removeSensitiveData(userData: Record<string, any>): void {
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
    delete userData['otp']
}

router.get(
    '/auth/oauth-endpoint',
    [query('provider').isString()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { pb } = req

        const { provider } = req.query

        const oauthEndpoints = await pb.collection('users').listAuthMethods()

        const endpoint = oauthEndpoints.authProviders.find(
            item => item.name === provider
        )

        if (!endpoint) {
            clientError(res, 'Invalid provider')
            return
        }

        currentCodeVerifier = endpoint.codeVerifier

        successWithBaseResponse(res, endpoint)
    })
)

router.post(
    '/auth/oauth-verify',
    [body('provider').isString(), body('code').isString()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { provider: providerName, code } = req.body

        const providers = await pb.collection('users').listAuthMethods()

        const provider = providers.authProviders.find(
            item => item.name === providerName
        )

        if (!provider || !currentCodeVerifier) {
            clientError(res, 'Invalid login attempt')
            return
        }

        pb.collection('users')
            .authWithOAuth2Code(
                provider.name,
                code,
                currentCodeVerifier,
                `${req.headers.origin}/auth`,
                // pass optional user create data
                {
                    emailVisibility: false
                }
            )
            .then(authData => {
                if (authData) {
                    res.json({
                        state: 'success',
                        token: pb.authStore.token
                    })
                } else {
                    res.status(401).send({
                        state: 'error',
                        message: 'Invalid credentials'
                    })
                }
            })
            .catch(() => {
                res.status(401).send({
                    state: 'error',
                    message: 'Invalid credentials'
                })
            })
            .finally(() => {
                currentCodeVerifier = null
            })
    })
)

router.get('/auth/otp', async (req: Request, res: Response) => {
    const { pb } = req

    const response = await fetch(
        `${process.env.PB_HOST}/auth/otp/${pb.authStore.model!.id}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${pb.authStore.token}`
            }
        }
    ).then(res => res.json())

    if (response.message === 'OTP sent') {
        successWithBaseResponse(res)
    } else {
        clientError(res, response.error)
    }
})

router.post(
    '/auth/login',
    asyncWrapper(async (req: Request, res: Response) => {
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

            if (!userData) {
                res.status(401).send({
                    state: 'error',
                    message: 'Invalid credentials'
                })
                return
            }

            removeSensitiveData(userData)

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
    asyncWrapper(async (req: Request, res: Response) => {
        const bearerToken = req.headers.authorization?.split(' ')[1]
        const pb = new Pocketbase(process.env.PB_HOST)

        if (!bearerToken) {
            res.status(401).send({
                state: 'error',
                message: 'Invalid token'
            })
            return
        }

        pb.authStore.save(bearerToken, null)
        await pb.collection('users').authRefresh()

        if (pb.authStore.isValid) {
            const userData = pb.authStore.model

            if (!userData) {
                res.status(401).send({
                    state: 'error',
                    message: 'Invalid token'
                })
                return
            }

            removeSensitiveData(userData)

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
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id, data } = req.body
        await pb.collection('users').update(id, {
            enabledModules: data
        })

        successWithBaseResponse(res)
    })
)

router.put(
    '/module/config',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id, data } = req.body
        await pb.collection('users').update(id, {
            moduleConfigs: data
        })

        successWithBaseResponse(res)
    })
)

router.patch(
    '/personalization',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id, data } = req.body
        const toBeUpdated: { [key: string]: any } = {}

        for (let item of [
            'fontFamily',
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

        successWithBaseResponse(res)
    })
)

router.put(
    '/settings/avatar',
    singleUploadMiddleware,
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        const file = req.file

        if (!file) {
            throw new Error('No file uploaded')
        }

        const { id } = pb.authStore.model as any

        const fileBuffer = fs.readFileSync(file.path)

        const newRecord = await pb.collection('users').update(id, {
            avatar: new File(
                [fileBuffer],
                `${id}.${file.originalname.split('.').pop()}`
            )
        })

        fs.unlinkSync(file.path)

        successWithBaseResponse(res, newRecord.avatar)
    })
)

router.delete(
    '/settings/avatar',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = pb.authStore.model as any

        const newRecord = await pb.collection('users').update(id, {
            avatar: null
        })

        successWithBaseResponse(res, newRecord.avatar)
    })
)

router.patch(
    '/settings',
    [
        body('data.username').optional().isAlphanumeric(),
        body('data.email').optional().isEmail(),
        body('data.name').optional().isString()
    ],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { pb } = req
        const { id } = pb.authStore.model as any
        const { data } = req.body

        if (data.email) {
            await pb.collection('users').requestEmailChange(data.email)
        }

        const newData: {
            username?: string
            name?: string
        } = {}

        if (data.username) newData.username = data.username
        if (data.name) newData.name = data.name

        await pb.collection('users').update(id, newData)

        successWithBaseResponse(res)
    })
)

router.post(
    '/settings/request-password-reset',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req

        await pb
            .collection('users')
            .requestPasswordReset(pb.authStore.model?.email)

        successWithBaseResponse(res)
    })
)

export default router
