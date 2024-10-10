import * as s from 'superstruct'
import { BasePBCollectionSchema } from './pocketbase_interfaces.js'

const WalletAssetSchema = s.assign(
    BasePBCollectionSchema,
    s.object({
        name: s.string(),
        icon: s.string(),
        balance: s.optional(s.number()),
        starting_balance: s.number()
    })
)

const WalletLedgerSchema = s.assign(
    BasePBCollectionSchema,
    s.object({
        name: s.string(),
        icon: s.string(),
        color: s.string()
    })
)

const WalletTransactionEntrySchema = s.assign(
    BasePBCollectionSchema,
    s.object({
        type: s.union([
            s.literal('income'),
            s.literal('expenses'),
            s.literal('transfer')
        ]),
        side: s.union([s.literal('debit'), s.literal('credit')]),
        particulars: s.string(),
        amount: s.number(),
        date: s.string(),
        category: s.string(),
        asset: s.string(),
        ledger: s.string(),
        receipt: s.string()
    })
)

const WalletCategorySchema = s.assign(
    WalletLedgerSchema,
    s.object({
        type: s.union([s.literal('income'), s.literal('expenses')])
    })
)

const WalletIncomeExpensesSchema = s.object({
    totalIncome: s.number(),
    totalExpenses: s.number(),
    monthlyIncome: s.number(),
    monthlyExpenses: s.number()
})

type IWalletAsset = s.Infer<typeof WalletAssetSchema>
type IWalletLedger = s.Infer<typeof WalletLedgerSchema>
type IWalletTransactionEntry = s.Infer<typeof WalletTransactionEntrySchema>
type IWalletCategory = s.Infer<typeof WalletCategorySchema>
type IWalletIncomeExpenses = s.Infer<typeof WalletIncomeExpensesSchema>

export {
    WalletAssetSchema,
    WalletLedgerSchema,
    WalletTransactionEntrySchema,
    WalletCategorySchema,
    WalletIncomeExpensesSchema
}

export type {
    IWalletAsset,
    IWalletLedger,
    IWalletTransactionEntry,
    IWalletCategory,
    IWalletIncomeExpenses
}
