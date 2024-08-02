import { success } from './response.js'

async function list(req, res, collection, options = {}) {
    const { pb } = req

    const data = await pb.collection(collection).getFullList(options)

    success(res, data)
}

export { list }
