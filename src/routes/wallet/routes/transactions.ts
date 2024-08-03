import fs from 'fs'
import express, { Request, Response } from 'express'
import moment from 'moment'
import asyncWrapper from '../../../utils/asyncWrapper.js'
import {
    clientError,
    successWithBaseResponse
} from '../../../utils/response.js'
import { singleUploadMiddleware } from '../../../middleware/uploadMiddleware.js'
import { list } from '../../../utils/CRUD.js'
import { BaseResponse } from '../../../interfaces/base_response.js'
import {
    IWalletIncomeExpenses,
    IWalletTransactionEntry
} from '../../../interfaces/wallet_interfaces.js'
import { WithoutPBDefault } from '../../../interfaces/pocketbase_interfaces.js'

const router = express.Router()

router.get(
    '/',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IWalletIncomeExpenses[]>>
        ) => list(req, res, 'wallet_transactions', { sort: '-date,-created' })
    )
)

router.get(
    '/income-expenses/:year/:month',
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IWalletIncomeExpenses>>
        ) => {
            const { pb } = req
            const { year, month } = req.params

            const start = moment(`${year}-${month}-01`)
                .startOf('month')
                .format('YYYY-MM-DD')
            const end = moment(`${year}-${month}-01`)
                .endOf('month')
                .format('YYYY-MM-DD')

            const transactions = await pb
                .collection('wallet_transactions')
                .getFullList({
                    filter: "type = 'income' || type = 'expenses'",
                    sort: '-date,-created'
                })

            const inThisMonth = transactions.filter(
                transaction =>
                    moment(
                        moment(transaction.date).format('YYYY-MM-DD')
                    ).isSameOrAfter(start) &&
                    moment(
                        moment(transaction.date).format('YYYY-MM-DD')
                    ).isSameOrBefore(end)
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

            successWithBaseResponse(res, {
                totalIncome,
                totalExpenses,
                monthlyIncome,
                monthlyExpenses
            })
        }
    )
)

router.post(
    '/',
    singleUploadMiddleware,
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IWalletTransactionEntry[]>>
        ) => {
            const { pb } = req
            let {
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

            amount = +amount

            const file = req.file

            if (type === 'transfer') {
                if (!fromAsset || !toAsset) {
                    clientError(res, 'Missing required fields')
                    return
                }
            } else if (!particulars || !date || !amount || !type || !side) {
                clientError(res, 'Missing required fields')
                return
            }

            if (file) file.originalname = decodeURIComponent(file.originalname)

            const path = file?.originalname.split('/') ?? []
            const name = path.pop()

            let created: IWalletTransactionEntry[] = []

            if (type === 'income' || type === 'expenses') {
                const newData: WithoutPBDefault<
                    Omit<IWalletTransactionEntry, 'receipt'>
                > & {
                    receipt: File | ''
                } = {
                    particulars,
                    date,
                    amount,
                    category,
                    asset,
                    ledger,
                    type,
                    side,
                    receipt:
                        file && fs.existsSync(file.path)
                            ? (() => {
                                  const fileBuffer = fs.readFileSync(file.path)
                                  return new File(
                                      [fileBuffer],
                                      name ?? 'receipt.jpg',
                                      {
                                          type: file.mimetype
                                      }
                                  )
                              })()
                            : ''
                }

                const transaction: IWalletTransactionEntry = await pb
                    .collection('wallet_transactions')
                    .create(newData)
                created = [transaction]
            }

            if (type === 'transfer') {
                const _from = await pb
                    .collection('wallet_assets')
                    .getOne(fromAsset)
                const _to = await pb.collection('wallet_assets').getOne(toAsset)

                if (!_from || !_to) {
                    clientError(res, 'Invalid asset')
                    return
                }

                const baseTransferData: WithoutPBDefault<
                    Omit<
                        IWalletTransactionEntry,
                        'receipt' | 'category' | 'ledger'
                    >
                > & {
                    receipt: File | string
                } = {
                    type: 'transfer',
                    particulars: '',
                    date,
                    amount,
                    side: 'debit',
                    asset: '',
                    receipt:
                        file && fs.existsSync(file.path)
                            ? (() => {
                                  const fileBuffer = fs.readFileSync(file.path)
                                  return new File(
                                      [fileBuffer],
                                      name ?? 'receipt.jpg',
                                      {
                                          type: file.mimetype
                                      }
                                  )
                              })()
                            : ''
                }

                baseTransferData.particulars = `Transfer from ${_from.name}`
                baseTransferData.asset = toAsset
                const debit: IWalletTransactionEntry = await pb
                    .collection('wallet_transactions')
                    .create(baseTransferData)

                baseTransferData.particulars = `Transfer to ${_to.name}`
                baseTransferData.side = 'credit'
                baseTransferData.asset = fromAsset
                const credit: IWalletTransactionEntry = await pb
                    .collection('wallet_transactions')
                    .create(baseTransferData)

                created = [debit, credit]
            }

            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path)
            }

            successWithBaseResponse(res, created)
        }
    )
)

router.patch(
    '/:id',
    singleUploadMiddleware,
    asyncWrapper(
        async (
            req: Request,
            res: Response<BaseResponse<IWalletTransactionEntry>>
        ) => {
            const { pb } = req
            const { id } = req.params
            let {
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

            const file = req.file

            if (!id) {
                clientError(res, 'id is required')
                return
            }

            if (file) file.originalname = decodeURIComponent(file.originalname)

            const path = file?.originalname.split('/') ?? []
            const name = path.pop()

            const foundTransaction = await pb
                .collection('wallet_transactions')
                .getOne(id)

            amount = +amount

            const updatedData: WithoutPBDefault<
                Omit<IWalletTransactionEntry, 'receipt'>
            > & {
                receipt: File
            } = {
                particulars,
                date,
                amount,
                category,
                asset,
                ledger,
                type,
                side,
                receipt: (() => {
                    if (file && fs.existsSync(file.path)) {
                        const fileBuffer = fs.readFileSync(file.path)
                        return new File([fileBuffer], name ?? 'receipt.jpg', {
                            type: file.mimetype
                        })
                    }

                    if (removeReceipt) {
                        return ''
                    }

                    return foundTransaction.receipt
                })()
            }

            const transaction: IWalletTransactionEntry = await pb
                .collection('wallet_transactions')
                .update(id, updatedData)

            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path)
            }

            successWithBaseResponse(res, transaction)
        }
    )
)

router.delete(
    '/:id',
    asyncWrapper(async (req: Request, res: Response) => {
        const { pb } = req
        const { id } = req.params

        const transaction = await pb
            .collection('wallet_transactions')
            .getOne(id)

        await pb.collection('wallet_transactions').delete(id)

        successWithBaseResponse(res, transaction)
    })
)

export default router
