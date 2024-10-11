import { it } from 'vitest'
import { PBAuthToken, PBClient } from '../utils/PBClient.js'
import request from 'supertest'
import API_HOST from '../constant/API_HOST.js'
import { expect } from 'chai'
import { assert } from 'console'
import { Struct } from 'superstruct'

export default function testEntryModification({
    name,
    endpoint,
    schema,
    collection,
    oldData,
    newData
}: {
    name: string
    endpoint: string
    schema: Struct<any>
    collection: string
    oldData: any
    newData: any
}) {
    it(`should update an exsisting ${name}`, async () => {
        const entry = await PBClient.collection(collection).create(oldData)

        const res = await request(API_HOST)
            .patch(`${endpoint}/${entry.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send(newData)
            .expect(200)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('object')

        const updatedEntry = res.body.data

        assert(updatedEntry, schema, `Invalid schema for ${name}`)

        expect(updatedEntry.id).to.equal(entry.id)
        for (const key in newData) {
            expect(updatedEntry[key]).to.equal(newData[key])
        }

        await PBClient.collection(collection).delete(entry.id)
    })
}
