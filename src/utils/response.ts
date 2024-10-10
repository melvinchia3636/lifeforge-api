import { Response } from 'express'
import { BaseResponse } from '../interfaces/base_response.js'

function successWithBaseResponse<T>(
    res: Response<BaseResponse<T>>,
    data?: T,
    status: number = 200
) {
    res.status(status).json({
        state: 'success',
        data: data ?? undefined
    })
}

function success<T>(res: Response, data?: T, status: number = 200) {
    res.status(status).json({
        state: 'success',
        data: data ?? undefined
    })
}

function clientError(res: Response, message = 'Bad Request', status = 400) {
    res.status(status).json({
        state: 'error',
        message
    })
}

function serverError(res: Response, message = 'Internal Server Error') {
    res.status(500).json({
        state: 'error',
        message
    })
}

export { successWithBaseResponse, success, clientError, serverError }
