function success(res, data = null) {
    res.json({
        state: 'success',
        data,
    });
}

export { success };
