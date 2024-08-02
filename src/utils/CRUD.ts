import { Request, Response } from 'express'
import { success } from './response.js'
import { BaseResponse } from '../interfaces/base_response.js'

async function list<T>(
    req: Request,
    res: Response<BaseResponse<T[]>>,
    collection: string,
    options = {}
) {
    const { pb } = req

    const data: T[] = await pb.collection(collection).getFullList(options)

    success(res, data)
}

async function validate(req: Request, res: Response, collectionName: string) {
    const { pb } = req
    const { id } = req.params

    const { totalItems } = await pb.collection(collectionName).getList(1, 1, {
        filter: `id = "${id}"`
    })

    success(res, totalItems === 1)
}

export { list, validate }
