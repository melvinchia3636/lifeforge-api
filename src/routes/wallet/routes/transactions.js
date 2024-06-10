import fs from 'fs'
import express from 'express'
import moment from 'moment'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import { clientError, success } from '../../../utils/response.js'
import { singleUploadMiddleware } from '../../../middleware/uploadMiddleware.js'

const router = express.Router()

router.get(
    '/list',
    asyncWrapper(async (req, res) => {
        const { pb } = req

        const transactions = await pb
            .collection('wallet_transaction')
            .getFullList({
                sort: '-date,-created'
            })

        success(res, transactions)
    })
)

router.get(
    '/income-expenses/:year/:month',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { year, month } = req.params

        const start = moment(`${year}-${month}-01`)
            .startOf('month')
            .format('YYYY-MM-DD')
        const end = moment(`${year}-${month}-01`)
            .endOf('month')
            .format('YYYY-MM-DD')

        const transactions = await pb
            .collection('wallet_transaction')
            .getFullList({
                filter: "type = 'income' || type = 'expenses'",
                sort: '-date,-created'
            })

        const inThisMonth = transactions.filter(transaction =>
            moment(transaction.date).isBetween(start, end)
        )

        const totalIncome = transactions.reduce((acc, cur) => {
            if (cur.type === 'income') {
                return acc + cur.amount
            }

            return acc
        }, 0)

        const totalExpenses = transactions.reduce((acc, cur) => {
            if (cur.type === 'expenses') {
                return acc + cur.amount
            }

            return acc
        }, 0)

        const monthlyIncome = inThisMonth.reduce((acc, cur) => {
            if (cur.type === 'income') {
                return acc + cur.amount
            }

            return acc
        }, 0)

        const monthlyExpenses = inThisMonth.reduce((acc, cur) => {
            if (cur.type === 'expenses') {
                return acc + cur.amount
            }

            return acc
        }, 0)

        success(res, {
            totalIncome,
            totalExpenses,
            monthlyIncome,
            monthlyExpenses
        })
    })
)

router.post(
    '/create',
    singleUploadMiddleware,
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const {
            particulars,
            date,
            amount,
            category,
            asset,
            ledger,
            type,
            side,
            fromAsset,
            toAsset
        } = req.body

        const file = req.file || {}

        if (type === 'transfer') {
            if (!fromAsset || !toAsset) {
                clientError(res, 'Missing required fields')
                return
            }
        } else if (!particulars || !date || !amount || !type || !side) {
            clientError(res, 'Missing required fields')
            return
        }

        file.originalname = decodeURIComponent(file.originalname)

        const path = file.originalname.split('/')
        const name = path.pop()

        if (type === 'income' || type === 'expenses') {
            await pb.collection('wallet_transaction').create({
                particulars,
                date,
                amount,
                category,
                asset,
                ledger,
                type,
                side,
                receipt: fs.existsSync(file.path)
                    ? (() => {
                          const fileBuffer = fs.readFileSync(file.path)
                          return new File([fileBuffer], name, {
                              type: file.mimetype
                          })
                      })()
                    : ''
            })

            if (asset) {
                const _asset = await pb
                    .collection('wallet_assets')
                    .getOne(asset)

                if (side === 'credit') {
                    await pb.collection('wallet_assets').update(asset, {
                        balance: _asset.balance - amount
                    })
                } else {
                    await pb.collection('wallet_assets').update(asset, {
                        balance: _asset.balance + amount
                    })
                }
            }
        }

        if (type === 'transfer') {
            const _from = await pb.collection('wallet_assets').getOne(fromAsset)
            const _to = await pb.collection('wallet_assets').getOne(toAsset)

            if (!_from || !_to) {
                clientError(res, 'Invalid asset')
                return
            }

            await pb.collection('wallet_transaction').create({
                type: 'transfer',
                particulars: `Transfer from ${_from.name}`,
                date,
                amount,
                side: 'debit',
                asset: toAsset,
                receipt: fs.existsSync(file.path)
                    ? (() => {
                          const fileBuffer = fs.readFileSync(file.path)
                          return new File([fileBuffer], name, {
                              type: file.mimetype
                          })
                      })()
                    : ''
            })

            await pb.collection('wallet_transaction').create({
                type: 'transfer',
                particulars: `Transfer to ${_to.name}`,
                date,
                amount,
                side: 'credit',
                asset: fromAsset,
                receipt: fs.existsSync(file.path)
                    ? (() => {
                          const fileBuffer = fs.readFileSync(file.path)
                          return new File([fileBuffer], name, {
                              type: file.mimetype
                          })
                      })()
                    : ''
            })

            await pb.collection('wallet_assets').update(fromAsset, {
                balance: _from.balance - amount
            })

            await pb.collection('wallet_assets').update(toAsset, {
                balance: _to.balance + amount
            })
        }

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
        }

        success(res)
    })
)

router.patch(
    '/update/:id',
    singleUploadMiddleware,
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params
        const {
            particulars,
            date,
            amount,
            category,
            asset,
            ledger,
            type,
            side,
            removeReceipt
        } = req.body

        const file = req.file || {}

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        file.originalname = decodeURIComponent(file.originalname)

        const path = file.originalname.split('/')
        const name = path.pop()

        const transaction = await pb.collection('wallet_transaction').getOne(id)

        if (amount !== transaction.amount) {
            if (transaction.asset) {
                const _asset = await pb
                    .collection('wallet_assets')
                    .getOne(transaction.asset)

                if (transaction.side === 'debit') {
                    await pb
                        .collection('wallet_assets')
                        .update(transaction.asset, {
                            balance:
                                _asset.balance - transaction.amount + amount
                        })
                } else {
                    await pb
                        .collection('wallet_assets')
                        .update(transaction.asset, {
                            balance:
                                _asset.balance + transaction.amount - amount
                        })
                }
            }
        }

        await pb.collection('wallet_transaction').update(id, {
            particulars,
            date,
            amount,
            category,
            asset,
            ledger,
            type,
            side,
            receipt: (() => {
                if (fs.existsSync(file.path)) {
                    const fileBuffer = fs.readFileSync(file.path)
                    return new File([fileBuffer], name, { type: file.mimetype })
                }

                if (removeReceipt) {
                    return ''
                }

                return transaction.receipt
            })()
        })

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
        }

        success(res)
    })
)

router.delete(
    '/delete/:id',
    asyncWrapper(async (req, res) => {
        const { pb } = req
        const { id } = req.params

        if (!id) {
            clientError(res, 'id is required')
            return
        }

        const transaction = await pb.collection('wallet_transaction').getOne(id)

        if (transaction.asset) {
            const asset = await pb
                .collection('wallet_assets')
                .getOne(transaction.asset)

            if (transaction.side === 'debit') {
                await pb.collection('wallet_assets').update(transaction.asset, {
                    balance: asset.balance - transaction.amount
                })
            } else {
                await pb.collection('wallet_assets').update(transaction.asset, {
                    balance: asset.balance + transaction.amount
                })
            }
        }

        await pb.collection('wallet_transaction').delete(id)

        success(res, transaction)
    })
)

export default router
