import { validationResult } from 'express-validator'
import { clientError } from './response.js'

export default function hasError(req, res) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
        clientError(res, result.array())
        return true
    }
    return false
}
