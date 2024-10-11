import { describe } from 'vitest'
import { WalletCategorySchema } from '../../../src/interfaces/wallet_interfaces.js'
import testUnauthorized from '../../common/testUnauthorized.js'
import testList from '../../common/testList.js'
import testEntryCreation from '../../common/testEntryCreation.js'
import testInvalidOrMissingValue from '../../common/testInvalidOrMissingValue.js'
import testEntryNotFound from '../../common/testEntryNotFound.js'
import testEntryDeletion from '../../common/testEntryDeletion.js'
import testEntryModification from '../../common/testEntryModification.js'

describe('GET /wallet/categories', () => {
    testUnauthorized('/wallet/categories', 'get')
    testList('/wallet/categories', WalletCategorySchema, 'wallet category')
})

describe('POST /wallet/categories', () => {
    testUnauthorized('/wallet/categories', 'post')

    testEntryCreation({
        name: 'wallet category',
        endpoint: '/wallet/categories',
        schema: WalletCategorySchema,
        collection: 'wallet_categories',
        data: {
            name: 'Test Category',
            icon: 'test-icon',
            color: '#000000',
            type: 'expenses'
        }
    })

    testInvalidOrMissingValue({
        name: 'name',
        type: 'invalid',
        endpoint: '/wallet/categories',
        method: 'post',
        data: {
            name: 123,
            icon: 'test-icon',
            color: '#000000',
            type: 'expenses'
        }
    })

    testInvalidOrMissingValue({
        name: 'icon',
        type: 'invalid',
        endpoint: '/wallet/categories',
        method: 'post',
        data: {
            name: 'Test Category',
            icon: 123,
            color: '#000000',
            type: 'expenses'
        }
    })

    testInvalidOrMissingValue({
        name: 'color',
        type: 'invalid',
        endpoint: '/wallet/categories',
        method: 'post',
        data: {
            name: 'Test Category',
            icon: 'test-icon',
            color: 'not a color hex',
            type: 'expenses'
        }
    })

    testInvalidOrMissingValue({
        name: 'type',
        type: 'invalid',
        endpoint: '/wallet/categories',
        method: 'post',
        data: {
            name: 'Test Category',
            icon: 'test-icon',
            color: '#000000',
            type: 'not a type'
        }
    })

    for (const key of ['name', 'icon', 'color', 'type']) {
        const data = {
            name: 'Test Category',
            icon: 'test-icon',
            color: '#000000',
            type: 'expenses'
        }

        delete data[key as keyof typeof data]

        testInvalidOrMissingValue({
            name: key,
            type: 'missing',
            endpoint: '/wallet/categories',
            method: 'post',
            data
        })
    }
})

describe('PATCH /wallet/categories/:id', () => {
    testUnauthorized('/wallet/categories/123', 'patch')

    testEntryModification({
        name: 'wallet category',
        endpoint: '/wallet/categories',
        schema: WalletCategorySchema,
        collection: 'wallet_categories',
        oldData: {
            name: 'Test Category',
            icon: 'test-icon',
            color: '#000000',
            type: 'expenses'
        },
        newData: {
            name: 'Updated Category',
            icon: 'updated-icon',
            color: '#ffffff'
        }
    })

    testInvalidOrMissingValue({
        name: 'name',
        type: 'invalid',
        endpoint: '/wallet/categories/123',
        method: 'patch',
        data: {
            name: 123,
            icon: 'updated-icon',
            color: '#ffffff',
            type: 'income'
        }
    })

    testInvalidOrMissingValue({
        name: 'icon',
        type: 'invalid',
        endpoint: '/wallet/categories/123',
        method: 'patch',
        data: {
            name: 'Updated Category',
            icon: 123,
            color: '#ffffff',
            type: 'income'
        }
    })

    testInvalidOrMissingValue({
        name: 'color',
        type: 'invalid',
        endpoint: '/wallet/categories/123',
        method: 'patch',
        data: {
            name: 'Updated Category',
            icon: 'updated-icon',
            color: 'not a color hex',
            type: 'income'
        }
    })

    testEntryNotFound('/wallet/categories/123', 'patch', {
        name: 'Updated Category',
        icon: 'updated-icon',
        color: '#ffffff',
        type: 'income'
    })
})

describe('DELETE /wallet/categories/:id', () => {
    testUnauthorized('/wallet/categories/123', 'delete')

    testEntryDeletion({
        name: 'wallet category',
        endpoint: '/wallet/categories',
        collection: 'wallet_categories',
        data: {
            name: 'Test Category',
            icon: 'test-icon',
            color: '#000000',
            type: 'expenses'
        }
    })

    testEntryNotFound('/wallet/categories/123', 'delete')
})
