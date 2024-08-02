import express, { Request, Response } from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { body } from 'express-validator'
import hasError from '../../../utils/checkError.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import {
    IIdeaBoxEntry,
    IIdeaBoxFolder
} from '../../../interfaces/ideabox_interfaces.js'

const router = express.Router()

router.get(
    '/get/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
            const { pb } = req
            const { id } = req.params

            const folder: IIdeaBoxFolder = await pb
                .collection('idea_box_folders')
                .getOne(id)

            success(res, folder)
        }
    )
)

router.get(
    '/list/:id',
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder[]>>) =>
            list(req, res, 'idea_box_folders', {
                filter: `container = "${req.params.id}"`,
                sort: 'name'
            })
    )
)

router.post(
    '/',
    [
        body('name').exists().notEmpty(),
        body('container').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { name, container, icon, color } = req.body

            const folder: IIdeaBoxFolder = await pb
                .collection('idea_box_folders')
                .create({
                    name,
                    container,
                    icon,
                    color
                })

            success(res, folder)
        }
    )
)

router.patch(
    '/:id',
    [
        body('name').exists().notEmpty(),
        body('icon').exists().notEmpty(),
        body('color').exists().isHexColor()
    ],
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { id } = req.params
            const { name, icon, color } = req.body

            const folder: IIdeaBoxFolder = await pb
                .collection('idea_box_folders')
                .update(id, {
                    name,
                    icon,
                    color
                })

            success(res, folder)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
        const { pb } = req
        const { id } = req.params

        await pb.collection('idea_box_folders').delete(id)

        success(res)
    })
)

router.post(
    '/idea/:folderId',
    body('ideaId').exists().notEmpty(),
    asyncWrapper(
        async (req: Request, res: Response<BaseResponse<IIdeaBoxEntry>>) => {
            if (hasError(req, res)) return

            const { pb } = req
            const { folderId } = req.params
            const { ideaId } = req.body

            const entry: IIdeaBoxEntry = await pb
                .collection('idea_box_entries')
                .update(ideaId, {
                    folder: folderId
                })

            success(res, entry)
        }
    )
)

router.delete(
    '/idea/:folderId',
    asyncWrapper(async (req: Request, res: Response<BaseResponse>) => {
        const { pb } = req
        const { folderId } = req.params
        const { ideaId } = req.body

        if (!folderId) {
            clientError(res, 'folderId is required')
            return
        }

        if (!ideaId) {
            clientError(res, 'Idea id is required')
            return
        }

        const entry: IIdeaBoxEntry = await pb
            .collection('idea_box_entries')
            .update(ideaId, {
                folder: ''
            })

        success(res, entry)
    })
)

export default router
