import express, { Request, Response } from 'express'

import { exec } from 'child_process'
import os from 'os'
import osUtils from 'os-utils'
import si from 'systeminformation'
import { success } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'

const router = express.Router()

router.get(
    '/disks',
    asyncWrapper(async (req: Request, res: Response) => {
        const { err, stdout, stderr } = exec('df -h')
        if (err) {
            throw new Error(err)
        }
        stdout.on('data', data => {
            const result = data
                .split('\n')
                .map(e => e.split(' ').filter(e => e !== ''))
                .slice(1, -1)
                .filter(e => e[5].startsWith('/media'))
                .map(e => ({
                    name: e[5],
                    size: e[1].replace(/(\d)([A-Z])/, '$1 $2'),
                    used: e[2].replace(/(\d)([A-Z])/, '$1 $2'),
                    avail: e[3].replace(/(\d)([A-Z])/, '$1 $2'),
                    usedPercent: e[4]
                }))

            success(res, result)
        })

        stderr.on('data', data => {
            throw new Error(data)
        })
    })
)

router.get(
    '/memory',
    asyncWrapper(async (req: Request, res: Response) => {
        const total = os.totalmem()
        const free = os.freemem()
        const used = total - free
        const percent = (used / total) * 100

        success(res, {
            total,
            free,
            used,
            percent
        })
    })
)

router.get(
    '/cpu',
    asyncWrapper(async (req: Request, res: Response) => {
        osUtils.cpuUsage(v => {
            success(res, {
                usage: v * 100,
                uptime: os.uptime()
            })
        })
    })
)

router.get(
    '/info',
    asyncWrapper(async (req: Request, res: Response) => {
        const osInfo = await si.osInfo()
        const cpu = await si.cpu()
        const mem = await si.mem()
        const networkInterfaces = await si.networkInterfaces()
        const networkStats = await si.networkStats()

        success(res, {
            osInfo,
            cpu,
            mem,
            networkInterfaces,
            networkStats
        })
    })
)

router.get(
    '/cpu-temp',
    asyncWrapper(async (req: Request, res: Response) => {
        const temp = await si.cpuTemperature()
        success(res, temp)
    })
)

export default router
