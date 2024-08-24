import express, { Request, Response } from 'express'
import Pocketbase from 'pocketbase'
import moment from 'moment'
import { successWithBaseResponse } from '../../utils/response.js'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { IChangeLogVersion } from '../../interfaces/changelog_interfaces.js'
import { BaseResponse } from '../../interfaces/base_response.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IChangeLogVersion[]>>
        ) => {
            const pb = new Pocketbase('http://192.168.0.117:8090')
            const entries = await pb
                .collection('change_log_entries')
                .getFullList()

            const final: IChangeLogVersion[] = []

            for (const entry of entries) {
                const m = moment(entry.created_at)
                const [year, week] = [m.year(), m.week()]
                const versionNumber = `${year.toString().slice(2)}w${week.toString().padStart(2, '0')}`

                if (!final.find(item => item.version === versionNumber)) {
                    final.push({
                        version: versionNumber,
                        date_range: [
                            m.startOf('week').toISOString(),
                            m.endOf('week').toISOString()
                        ],
                        entries: []
                    })
                }

                final
                    .find(item => item.version === versionNumber)
                    ?.entries.push({
                        id: entry.id,
                        feature: entry.feature,
                        description: entry.description
                    })
            }

            successWithBaseResponse(res, final.sort((a, b) => (a.date_range[0] > b.date_range[0] ? -1 : 1)))
        }
    )
)

export default router
