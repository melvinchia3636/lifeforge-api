import { it } from 'vitest'
import request from 'supertest'
import API_HOST from '../constant/API_HOST.js'
import { expect } from 'chai'

export default function testUnauthorized(
    endpoint: string,
    method: 'get' | 'post' | 'patch' | 'delete'
) {
    return it('should return unauthorized without auth token', async () => {
        const res = await request(API_HOST)[method](endpoint).expect(401)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property(
            'message',
            'Authorization token is required'
        )
    })
}
