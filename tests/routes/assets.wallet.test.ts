import { expect } from 'chai'
import request from 'supertest'
import { describe, it } from 'vitest'

import { PBAuthToken, PBClient } from '../utils/PBClient.js'
import API_HOST from '../constant/API_HOST.js'
import { assert } from 'superstruct'
import { WalletAssetSchema } from '../../src/interfaces/wallet_interfaces.js'
import testUnauthorized from '../common/unauthorized.js'

describe('GET /wallet/assets', () => {
    testUnauthorized('/wallet/assets', 'get')

    it('should return a list of assets', async () => {
        const res = await request(API_HOST)
            .get('/wallet/assets')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(200)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('array')

        const assets = res.body.data

        for (const asset of assets) {
            assert(asset, WalletAssetSchema, 'Invalid schema for wallet asset')
        }
    })
})

describe('POST /wallet/assets', () => {
    testUnauthorized('/wallet/assets', 'post')

    it('should create a new asset', async () => {
        const data = {
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 1000
        }

        const res = await request(API_HOST)
            .post('/wallet/assets')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(200)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('object')

        const asset = res.body.data

        assert(asset, WalletAssetSchema, 'Invalid schema for wallet asset')

        expect(asset.name).to.equal(data.name)
        expect(asset.icon).to.equal(data.icon)
        expect(asset.starting_balance).to.equal(data.starting_balance)

        await PBClient.collection('wallet_assets')
            .getOne(asset.id)
            .catch(() => {
                throw new Error('Asset not found in database')
            })

        await PBClient.collection('wallet_assets').delete(asset.id)
    })

    it('should return error 400 on invalid name', async () => {
        const data = {
            name: 123,
            icon: 'test-icon',
            starting_balance: 1000
        }

        const res = await request(API_HOST)
            .post('/wallet/assets')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'name: Invalid value')
    })

    it('should return error 400 on invalid icon', async () => {
        const data = {
            name: 'Test Asset',
            icon: 123,
            starting_balance: 1000
        }

        const res = await request(API_HOST)
            .post('/wallet/assets')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'icon: Invalid value')
    })

    it('should return error 400 on invalid starting balance', async () => {
        const data = {
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 'abc'
        }

        const res = await request(API_HOST)
            .post('/wallet/assets')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property(
            'message',
            'starting_balance: Invalid value'
        )
    })

    it('should return error 400 on missing request data', async () => {
        for (const key of ['name', 'icon', 'starting_balance']) {
            const data = {
                name: 'Test Asset',
                icon: 'test-icon',
                starting_balance: 1000
            }

            delete data[key as keyof typeof data]

            const res = await request(API_HOST)
                .post('/wallet/assets')
                .set('Authorization', `Bearer ${PBAuthToken}`)
                .send(data)
                .expect(400)

            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('state', 'error')
            expect(res.body).to.have.property(
                'message',
                `${key}: Invalid value`
            )
        }
    })
})

describe('PATCH /wallet/assets/:id', () => {
    testUnauthorized('/wallet/assets/123', 'patch')

    it('should update an asset', async () => {
        const asset = await PBClient.collection('wallet_assets').create({
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 1000
        })

        const data = {
            name: 'Updated Asset',
            icon: 'updated-icon',
            starting_balance: 2000
        }

        const res = await request(API_HOST)
            .patch(`/wallet/assets/${asset.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(200)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('object')

        const updatedAsset = res.body.data

        assert(
            updatedAsset,
            WalletAssetSchema,
            'Invalid schema for wallet asset'
        )

        expect(updatedAsset.id).to.equal(asset.id)
        expect(updatedAsset.name).to.equal(data.name)
        expect(updatedAsset.icon).to.equal(data.icon)
        expect(updatedAsset.starting_balance).to.equal(data.starting_balance)

        await PBClient.collection('wallet_assets').delete(asset.id)
    })

    it('should return error 400 on invalid name', async () => {
        const asset = await PBClient.collection('wallet_assets').create({
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 1000
        })

        const data = {
            name: 123,
            icon: 'updated-icon',
            starting_balance: 2000
        }

        const res = await request(API_HOST)
            .patch(`/wallet/assets/${asset.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'name: Invalid value')

        await PBClient.collection('wallet_assets').delete(asset.id)
    })

    it('should return error 400 on invalid icon', async () => {
        const asset = await PBClient.collection('wallet_assets').create({
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 1000
        })

        const data = {
            name: 'Updated Asset',
            icon: 123,
            starting_balance: 2000
        }

        const res = await request(API_HOST)
            .patch(`/wallet/assets/${asset.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'icon: Invalid value')

        await PBClient.collection('wallet_assets').delete(asset.id)
    })

    it('should return error 400 on invalid starting balance', async () => {
        const asset = await PBClient.collection('wallet_assets').create({
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 1000
        })

        const data = {
            name: 'Updated Asset',
            icon: 'updated-icon',
            starting_balance: 'abc'
        }

        const res = await request(API_HOST)
            .patch(`/wallet/assets/${asset.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property(
            'message',
            'starting_balance: Invalid value'
        )

        await PBClient.collection('wallet_assets').delete(asset.id)
    })

    it('should return error 400 on missing request data', async () => {
        const asset = await PBClient.collection('wallet_assets').create({
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 1000
        })

        for (const key of ['name', 'icon', 'starting_balance']) {
            const data = {
                name: 'Updated Asset',
                icon: 'updated-icon',
                starting_balance: 2000
            }

            delete data[key as keyof typeof data]

            const res = await request(API_HOST)
                .patch(`/wallet/assets/${asset.id}`)
                .set('Authorization', `Bearer ${PBAuthToken}`)
                .send(data)
                .expect(400)

            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('state', 'error')
            expect(res.body).to.have.property(
                'message',
                `${key}: Invalid value`
            )
        }

        await PBClient.collection('wallet_assets').delete(asset.id)
    })

    it('should return error 404 if asset not found', async () => {
        const data = {
            name: 'Updated Asset',
            icon: 'updated-icon',
            starting_balance: 2000
        }

        const res = await request(API_HOST)
            .patch('/wallet/assets/123')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(404)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'Entry not found')
    })
})

describe('DELETE /wallet/assets/:id', () => {
    testUnauthorized('/wallet/assets/123', 'delete')

    it('should delete an asset', async () => {
        const asset = await PBClient.collection('wallet_assets').create({
            name: 'Test Asset',
            icon: 'test-icon',
            starting_balance: 1000
        })

        const res = await request(API_HOST)
            .delete(`/wallet/assets/${asset.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(200)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')

        await PBClient.collection('wallet_assets')
            .getOne(asset.id)
            .then(() => {
                throw new Error('Asset still exists in database')
            })
            .catch(() => {})
    })

    it('should return error 404 if asset not found', async () => {
        const res = await request(API_HOST)
            .delete('/wallet/assets/123')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(404)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'Entry not found')
    })
})
