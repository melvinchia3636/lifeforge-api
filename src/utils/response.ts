import { Response } from 'express'

function success<T>(res: Response, data?: T) {
    res.json({
        state: 'success',
        data: data ?? undefined
    })
}

function clientError(res: Response, message = 'Bad Request') {
    res.status(400).json({
        state: 'error',
        message
    })
}

export { success, clientError }
