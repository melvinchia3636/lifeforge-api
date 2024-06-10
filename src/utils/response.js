function success(res, data = null) {
    res.json({
        state: 'success',
        data
    })
}

function clientError(res, message = 'Bad Request') {
    res.status(400).json({
        state: 'error',
        message
    })
}

export { success, clientError }
