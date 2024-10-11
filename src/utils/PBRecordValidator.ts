import Pocketbase from 'pocketbase'
import { clientError } from './response.js'
import { Request, Response } from 'express'

export async function checkExistence(
    req: Request,
    res: Response,
    collection: string,
    id: string
): Promise<boolean> {
    const found =
        (await req.pb
            .collection(collection)
            .getOne(id)
            .then(() => true)
            .catch(() => {
                clientError(res, 'Entry not found', 404)
            })) ?? false

    return found
}

export async function validateExistence(
    pb: Pocketbase,
    collection: string,
    id: string,
    optional = false
): Promise<boolean> {
    if (optional && !id) return true

    await pb
        .collection(collection)
        .getOne(id)
        .catch(() => {
            throw new Error('Invalid value')
        })

    return true
}
