import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { successWithBaseResponse } from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IProjectsMTechnology } from '../../../interfaces/projects_m_interfaces.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMTechnology[]>>
        ) =>
            list(req, res, 'projects_m_technologies', {
                sort: 'name'
            })
    )
)

router.post(
    '/',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMTechnology>>
        ) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, icon } = req.body

            console.log(name, icon)

            const technology: IProjectsMTechnology = await pb
                .collection('projects_m_technologies')
                .create({
                    name,
                    icon
                })

            successWithBaseResponse(res, technology)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IProjectsMTechnology>>
        ) => {
            const { pb } = req
            const { id } = req.params
            const { name, icon } = req.body

            const technology: IProjectsMTechnology = await pb
                .collection('projects_m_technologies')
                .update(id, {
                    name,
                    icon
                })

            successWithBaseResponse(res, technology)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('projects_m_technologies').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
