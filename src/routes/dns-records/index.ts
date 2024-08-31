import express, { Request, Response } from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import {
    clientError,
    serverError,
    successWithBaseResponse
} from '../../utils/response.js'
import { body, param, query } from 'express-validator'
import hasError from '../../utils/checkError.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const url =
            'https://cpanel.thecodeblog.net/execute/DNS/parse_zone?zone=thecodeblog.net'
        const headers = {
            Authorization: `cpanel thecodeb:${process.env.CPANEL_API_TOKEN}`
        }

        const response = await fetch(url, { headers })
        const raw = await response.json()
        const { data } = raw

        data.forEach((record: any) => {
            if (Object.keys(record).includes('dname_b64')) {
                record.dname_b64 = atob(record.dname_b64)
            }

            if (Object.keys(record).includes('data_b64')) {
                record.data_b64 = record.data_b64.map((item: string) =>
                    atob(item)
                )
            }

            if (Object.keys(record).includes('text_b64')) {
                record.text_b64 = atob(record.text_b64)
            }
        })

        successWithBaseResponse(res, data)
    })
)

router.delete(
    '/',
    [body('target').isArray(), query('serial').isNumeric()],
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { target } = req.body
        const { serial } = req.query

        const url = `https://cpanel.thecodeblog.net/execute/DNS/mass_edit_zone?zone=thecodeblog.net&serial=${serial}&${target.map((item: string) => `remove=${item}`).join('&')}`
        const headers = {
            Authorization: `cpanel thecodeb:${process.env.CPANEL_API_TOKEN}`
        }

        const response = await fetch(url, { headers })
        const raw = await response.json()

        console.log(raw)

        if (response.ok && raw.data && !raw.errors) {
            successWithBaseResponse(res, raw.data.newSerial)
            return
        }

        serverError(res, raw.errors[0])
    })
)

export default router
