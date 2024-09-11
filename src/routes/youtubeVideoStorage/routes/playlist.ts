import express, { Request, Response } from 'express'
import { param } from 'express-validator'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import hasError from '../../../utils/checkError.js'
import {
    successWithBaseResponse,
    serverError
} from '../../../utils/response.js'
import getPlaylist from '../functions/getPlaylist.js'

const router = express.Router()

router.get(
    '/get-info/:id',
    param('id').isString(),
    asyncWrapper(async (req: Request, res: Response) => {
        if (hasError(req, res)) return

        const { id } = req.params

        await getPlaylist(`https://www.youtube.com/playlist?list=${id}`)
            .then(playlist => {
                successWithBaseResponse(res, playlist)
            })
            .catch(() => {
                serverError(res, 'Error fetching playlist')
            })
    })
)

export default router
