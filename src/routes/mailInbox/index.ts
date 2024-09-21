import imaps from 'imap-simple'
import _ from 'underscore'
import express, { Request, Response } from 'express'
import { successWithBaseResponse } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { getAPIKey } from '../../utils/getAPIKey.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const key = await getAPIKey('gmail', req.pb)

        if (!key) {
            res.status(500).json({
                state: 'error',
                message: 'API key not found'
            })
            return
        }

        const config = {
            imap: {
                user: 'melvinchia623600@gmail.com',
                password: key,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 3000,
                tlsOptions: { rejectUnauthorized: false }
            }
        }

        imaps
            .connect(config)
            .then(async connection => {
                return connection
                    .openBox('INBOX')
                    .then(() => {
                        const searchCriteria = ['ALL']

                        const fetchOptions = {
                            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                            markSeen: false,
                            struct: true
                        }

                        return connection.search(searchCriteria, fetchOptions)
                    })
                    .then(messages => {
                        messages = messages.sort(
                            (a, b) => +b.attributes.date - +a.attributes.date
                        )

                        const cleanedUpMessages = messages.map(
                            async message => {
                                const header = message.parts.find(part =>
                                    part.which.startsWith('HEADER')
                                )

                                return {
                                    ...Object.fromEntries(
                                        Object.entries(header?.body).map(
                                            ([key, value]) => {
                                                // @ts-ignore
                                                return [key, value[0]]
                                            }
                                        )
                                    ),
                                    seen: message.attributes.flags.includes(
                                        '\\Seen'
                                    )
                                }
                            }
                        )

                        Promise.all(cleanedUpMessages).then(
                            cleanedUpMessages => {
                                successWithBaseResponse(res, cleanedUpMessages)
                            }
                        )

                        connection.end()
                    })
                    .catch(err => {
                        res.status(500).json({
                            state: 'error',
                            message: err.message
                        })
                    })
            })
            .catch(err => {
                res.status(500).json({
                    state: 'error',
                    message: err.message
                })
            })
    })
)

export default router
