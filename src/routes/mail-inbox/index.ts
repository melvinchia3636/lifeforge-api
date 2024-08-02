import imaps from 'imap-simple'
import _ from 'underscore'
import express, { Request, Response } from 'express'
import { success } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'

const router = express.Router()

const config = {
    imap: {
        user: 'melvinchia623600@gmail.com',
        password: process.env.GMAIL_APP_PASSWORD,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: { rejectUnauthorized: false }
    }
}

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        imaps
            .connect(config)
            .then(connection => {
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
                            (a, b) => b.attributes.date - a.attributes.date
                        )

                        const cleanedUpMessages = messages.map(
                            async message => {
                                const header = _.find(message.parts, {
                                    which: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'
                                })
                                return Object.fromEntries(
                                    Object.entries(header.body).map(
                                        ([key, value]) => {
                                            return [key, value[0]]
                                        }
                                    )
                                )
                            }
                        )

                        Promise.all(cleanedUpMessages).then(
                            cleanedUpMessages => {
                                success(res, cleanedUpMessages)
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
