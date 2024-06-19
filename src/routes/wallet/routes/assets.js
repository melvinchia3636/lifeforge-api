import express from 'express'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const assets = await pb.collection('wallet_assets').getFullList()
        const transactions = await pb
            .collection('wallet_transaction')
            .getFullList()

        assets.forEach(asset => {
            asset.balance = transactions
                .filter(transaction => transaction.asset === asset.id)
                .reduce((acc, curr) => {
                    return curr.side === 'credit'
                        ? acc - curr.amount
                        : acc + curr.amount
                }, asset.starting_balance)
        })

        success(res, assets)
    })
)

router.post(
    '/',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { name, icon, starting_balance } = req.body

        if (!name || !icon || !starting_balance) {
            clientError(res, 'Missing required fields')
            return
        }

        const asset = await pb.collection('wallet_assets').create({
            name,
            icon,
            starting_balance
        })

        success(res, asset)
    })
)

router.patch(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const { name, icon, starting_balance } = req.body

        if (!id || !name || !icon || !starting_balance) {
            clientError(res, 'Missing required fields')
            return
        }

        const asset = await pb.collection('wallet_assets').update(id, {
            name,
            icon,
            starting_balance
        })

        success(res, asset)
    })
)

router.delete(
    '/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        const asset = await pb.collection('wallet_assets').delete(id)

        success(res, asset)
    })
)

export default router
