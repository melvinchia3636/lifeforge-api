import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { successWithBaseResponse } from '../../../utils/response.js'
import { list, validate } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import { IProjectsMEntry } from '../../../interfaces/projects_m_interfaces.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IProjectsMEntry[]>>) =>
            list(req, res, 'projects_m_entries')
    )
)

router.get(
    '/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IProjectsMEntry>>) => {
            const { pb } = req
            const { id } = req.params

            const entry: IProjectsMEntry = await pb
                .collection('projects_m_entries')
                .getOne(id)

            successWithBaseResponse(res, entry)
        }
    )
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req: Request, res: Response<boolean>) =>
        validate(req, res, 'projects_m_entries')
    )
)

router.post(
    '/',
    [
        body('name').isString(),
        body('icon').isString(),
        body('color').isHexColor(),
        body('visibility').isBoolean(),
        body('status').isString(),
        body('category').isString(),
        body('technologies').isArray()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IProjectsMEntry>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const {
                name,
                icon,
                color,
                visibility,
                status,
                category,
                technologies
            } = req.body

            const entry: IProjectsMEntry = await pb
                .collection('projects_m_entries')
                .create({
                    name,
                    icon,
                    color,
                    visibility,
                    status,
                    category,
                    technologies
                })

            successWithBaseResponse(res, entry)
        }
    )
)

router.patch(
    '/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IProjectsMEntry>>) => {
            const { pb } = req
            const { id } = req.params
            const {
                name,
                icon,
                color,
                visibility,
                status,
                category,
                technologies
            } = req.body

            const entries: IProjectsMEntry = await pb
                .collection('projects_m_entries')
                .update(id, {
                    name,
                    icon,
                    color,
                    visibility,
                    status,
                    category,
                    technologies
                })

            successWithBaseResponse(res, entries)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('projects_m_entries').delete(id)

        successWithBaseResponse(res)
    })
)

export default router
