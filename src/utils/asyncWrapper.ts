import { NextFunction, Request, Response } from 'express'

const asyncWrapper =
    (cb: Function) => (req: Request, res: Response, next: NextFunction) =>
        cb(req, res, next).catch(next)

export default asyncWrapper
