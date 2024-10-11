import { it } from 'vitest'
import { PBAuthToken, PBClient } from '../utils/PBClient.js'
import request from 'supertest'
import API_HOST from '../constant/API_HOST.js'
import { expect } from 'chai'

export default function testEntryDeletion({
    name,
    endpoint,
    collection,
    data
}: {
    name: string
    endpoint: string
    collection: string
    data: any
}) {
    it(`should delete an existing ${name} entry`, async () => {
        const entry = await PBClient.collection(collection).create(data)

        const res = await request(API_HOST)
            .delete(`${endpoint}/${entry.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(410)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')

        await PBClient.collection(collection)
            .getOne(entry.id)
            .then(() => {
                throw new Error('Entry still exists in database')
            })
            .catch(() => {})
    })
}
