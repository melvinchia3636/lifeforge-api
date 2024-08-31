import { NextFunction, Request, Response } from 'express'

const asyncWrapper =
    (cb: Function) => (req: Request, res: Response, next: NextFunction) =>
        cb(req, res, next).catch(() => {
            res.status(500).json({
                state: 'error',
                message: 'Internal Server Error'
            })
        })

export default asyncWrapper
