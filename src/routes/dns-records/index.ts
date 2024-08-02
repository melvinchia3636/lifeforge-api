import express, { Request, Response } from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { success } from '../../utils/response.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const url =
            'https://thecodeblog.net:2083/execute/DNS/parse_zone?zone=thecodeblog.net'
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

        success(res, data)
    })
)

export default router
