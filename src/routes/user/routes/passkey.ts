import express, { Request, Response } from 'express'
import * as webauthn from '@passwordless-id/webauthn'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'

if (!process.env.PB_EMAIL || !process.env.PB_PASSWORD) {
    console.error('ERROR: PB_EMAIL and PB_PASSWORD must be set')
    process.exit(1)
}

const router = express.Router()

let challenge = webauthn.utils.randomChallenge()

setTimeout(
    () => {
        challenge = webauthn.utils.randomChallenge()
    },
    1000 * 60 * 60 * 24
)

router.get(
    '/challenge',
    asyncWrapper(async (req: Request, res: Response) => {
        successWithBaseResponse(res, challenge)
    })
)

router.post(
    '/register',
    asyncWrapper(async (req: Request, res: Response) => {
        const {
            username,
            credential: { id, publicKey, algorithm }
        } = req.body

        const { pb } = req

        await pb.admins.authWithPassword(
            process.env.PB_EMAIL!,
            process.env.PB_PASSWORD!
        )

        const user = await pb
            .collection('users')
            .getFirstListItem(`email = "${username}"`)

        if (!user) {
            res.status(404).json({
                state: 'error',
                message: 'User not found'
            })

            return
        }

        await pb.collection('users').update(user.id, {
            webauthnCredentialId: id,
            webauthnPublicKey: publicKey,
            webauthnAlgorithm: algorithm
        })

        successWithBaseResponse(res, 'register')
    })
)

router.post(
    '/login',
    asyncWrapper(async (req: Request, res: Response) => {
        const data = req.body

        const { pb } = req

        await pb.admins.authWithPassword(
            process.env.PB_EMAIL!,
            process.env.PB_PASSWORD!
        )

        const user = await pb
            .collection('users')
            .getFirstListItem(`webauthnCredentialId = "${data.credentialId}"`)

        if (!user) {
            clientError(res, 'User not found')
        }

        const { webauthnPublicKey, webauthnAlgorithm } = user

        const credentialKey = {
            id: data.credentialId,
            publicKey: webauthnPublicKey,
            algorithm: webauthnAlgorithm
        }

        const expected = {
            challenge,
            origin: 'http://localhost:5173',
            userVerified: true,
            counter: -1
        }

        const verified = await webauthn.server.verifyAuthentication(
            data,
            credentialKey,
            expected
        )

        if (verified.authenticator.flags.userVerified) {
            const { token } = await fetch(
                `${process.env.PB_HOST}/auth/get-token/${user.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${pb.authStore.token}`
                    }
                }
            ).then(res => res.json())

            res.json({
                state: 'success',
                token
            })
        } else {
            res.status(401).json({
                state: 'error',
                message: 'User not verified'
            })
        }
    })
)

export default router
