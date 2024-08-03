import { Response } from 'express'
import { BaseResponse } from '../interfaces/base_response.js'

function successWithBaseResponse<T>(res: Response<BaseResponse<T>>, data?: T) {
    res.json({
        state: 'success',
        data: data ?? undefined
    })
}

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

function serverError(res: Response, message = 'Internal Server Error') {
    res.status(500).json({
        state: 'error',
        message
    })
}

export { successWithBaseResponse, success, clientError, serverError }
