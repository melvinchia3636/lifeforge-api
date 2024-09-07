import express, { Request, Response } from 'express'
import { exec } from 'child_process'
import { successWithBaseResponse } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/stats',
    asyncWrapper(async (req: Request, res: Response) => {
        const { stdout, stderr } = exec('df -h')

        stdout?.on('data', data => {
            const result = data
                .split('\n')
                .map((e: string) => e.split(' ').filter(e => e !== ''))
                .slice(1, -1)
                .filter((e: string[]) => e[8].startsWith('/home/pi'))
                .map((e: string[]) => ({
                    name: e[8],
                    size: e[1],
                    used: e[2],
                    avail: e[3],
                    usedPercent: e[4]
                }))

            successWithBaseResponse(res, result)
        })

        stderr?.on('data', data => {
            throw new Error(data)
        })
    })
)

export default router
