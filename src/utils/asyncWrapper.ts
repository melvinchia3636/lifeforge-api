import { NextFunction, Request, Response } from 'express'

const asyncWrapper =
    (cb: Function) => (req: Request, res: Response, next: NextFunction) =>
        cb(req, res, next).catch((err: any) => {
            console.error(`Error: ${err.message}`)
            res.status(500).json({
                state: 'error',
                message: 'Internal Server Error'
            })
        })

export default asyncWrapper
