import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { list } from '../../../utils/CRUD.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => list(req, res, 'wallet_ledgers'))
)

router.post(
    '/',
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
    '/:id',
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
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const ledger = await pb.collection('wallet_ledgers').delete(id)

        success(res, ledger)
    })
)

export default router
