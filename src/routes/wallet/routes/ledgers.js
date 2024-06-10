import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const ledgers = await pb.collection('wallet_ledgers').getFullList()

        success(res, ledgers)
    })
)

router.post(
    '/create',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, icon, color } = req.body

        if (!name || !icon || !color) {
            clientError(res, 'Missing required fields')
            return
        }

        const ledger = await pb.collection('wallet_ledgers').create({
            name,
            icon,
            color
        })

        success(res, ledger)
    })
)

router.patch(
    '/update/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { name, icon, color } = req.body

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const ledger = await pb.collection('wallet_ledgers').update(id, {
            name,
            icon,
            color
        })

        success(res, ledger)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const ledger = await pb.collection('wallet_ledgers').delete(id)

        success(res, ledger)
    })
)

export default router
