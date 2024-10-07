import { NextFunction, Request, Response } from 'express'

const asyncWrapper =
    (cb: Function) => (req: Request, res: Response, next: NextFunction) =>
        cb(req, res, next).catch((err: any) => {
            console.error(`Error: ${err.message}`)
            try {
                res.status(500).json({
                    state: 'error',
                    message: 'Internal Server Error'
                })
            } catch {
                console.error('Error while sending response')
            }
        })

export default asyncWrapper
