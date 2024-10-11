import request from 'supertest'
import API_HOST from '../constant/API_HOST.js'
import { PBAuthToken } from '../utils/PBClient.js'
import { expect } from 'chai'
import { it } from 'vitest'

export default function testEntryNotFound(
    endpoint: string,
    method: 'get' | 'post' | 'patch' | 'delete',
    data?: any
) {
    it('should return 404 if entry is not found', async () => {
        const res = await request(API_HOST)
            [method](endpoint)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(data)
            .expect(404)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'Entry not found')
    })
}
