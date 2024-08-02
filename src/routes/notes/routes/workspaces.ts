import express, { Request, Response } from 'express'
import { success } from '../../../utils/response.js'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { validate } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const category = await pb
            .collection('notes_workspaces')
            .getOne(req.params.id)

        success(res, category)
    })
)

router.get(
    '/valid/:id',
    asyncWrapper(async (req: Request, res: Response) =>
        validate(req, res, 'notes_workspaces')
    )
)

router.get(
    '/list',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const categories = await pb.collection('notes_workspaces').getFullList()

        success(res, categories)
    })
)

export default router
