import asyncWrapper from '../utils/asyncWrapper.js'
import { success } from '../utils/response.js'

export default collectionName =>
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const { totalItems } = await pb
            .collection(collectionName)
            .getList(1, 1, {
                filter: `id = "${id}"`
            })

        success(res, totalItems === 1)
    })
