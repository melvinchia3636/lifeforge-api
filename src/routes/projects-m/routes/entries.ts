import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { list, validate } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req: Request, res: Response) =>
        list(req, res, 'projects_m_entries')
    )
)

router.get(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('projects_m_entries').getOne(id)

        success(res, entries)
    })
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req: Request, res: Response) =>
        validate(req, res, 'projects_m_entries')
    )
)

router.post(
    '/',
    asyncWrapper(async (req: Request, res: Response) => {
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

        if (!name || !icon || !color || !visibility || !status || !category) {
            clientError(res, 'Missing required fields')
            return
        }

        const entries = await pb.collection('projects_m_entries').create({
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        })

        success(res, entries)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
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

        const entries = await pb.collection('projects_m_entries').update(id, {
            name,
            icon,
            color,
            visibility,
            status,
            category,
            technologies
        })

        success(res, entries)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        const entries = await pb.collection('projects_m_entries').delete(id)

        success(res, entries)
    })
)

export default router
