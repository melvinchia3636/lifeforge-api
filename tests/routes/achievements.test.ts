import { assert, expect } from 'chai'
import request from 'supertest'
import { describe, it } from 'vitest'

import { AchievementsEntrySchema } from '../../src/interfaces/achievements_interfaces.js'
import { LoremIpsum } from 'lorem-ipsum'
import { PBAuthToken, PBClient } from '../utils/PBClient.js'
import API_HOST from '../constant/API_HOST.js'
import testUnauthorized from '../common/unauthorized.js'

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
})

describe('GET /achievements/entries', () => {
    testUnauthorized('/achievements/entries/easy', 'get')

    it('should return the list of achievements entries for each difficulty', async () => {
        const DIFFICULTIES = ['easy', 'medium', 'hard', 'impossible']

        for (const difficulty of DIFFICULTIES) {
            const res = await request(API_HOST)
                .get(`/achievements/entries/${difficulty}`)
                .set('Authorization', `Bearer ${PBAuthToken}`)
                .expect(200)

            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('state', 'success')
            expect(res.body).to.have.property('data')
            expect(res.body.data).to.be.an('array')
        }
    })

    it('should return 400 if difficulty is not valid', async () => {
        const res = await request(API_HOST)
            .get('/achievements/entries/invalid')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property(
            'message',
            'difficulty: Invalid value'
        )
    })

    it('should return 404 if difficulty is not provided', async () => {
        const res = await request(API_HOST)
            .get('/achievements/entries')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(404)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'Not Found')
    })
})

describe('POST /achievements/entries', () => {
    testUnauthorized('/achievements/entries', 'post')

    it('should create a new achievement entry for each difficulty', async () => {
        for (const difficulty of ['easy', 'medium', 'hard', 'impossible']) {
            const data = {
                difficulty,
                title: lorem.generateWords(3),
                thoughts: lorem.generateWords(10)
            }

            const res = await request(API_HOST)
                .post('/achievements/entries')
                .set('Authorization', `Bearer ${PBAuthToken}`)
                .send(data)
                .expect(201)

            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('state', 'success')
            expect(res.body).to.have.property('data')
            expect(res.body.data).to.be.an('object')

            const entry = res.body.data

            assert(
                AchievementsEntrySchema.is(entry),
                'Invalid schema for achievements entry'
            )

            expect(entry.difficulty).to.equal(data.difficulty)
            expect(entry.title).to.equal(data.title)
            expect(entry.thoughts).to.equal(data.thoughts)

            await PBClient.collection('achievements_entries')
                .getOne(entry.id)
                .catch(() => {
                    throw new Error('Entry not found in database')
                })

            await PBClient.collection('achievements_entries').delete(entry.id)
        }
    })

    it('should return 400 on invalid difficulty', async () => {
        const res = await request(API_HOST)
            .post('/achievements/entries')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send({
                difficulty: 'invalid',
                title: 'Title',
                thoughts: 'Thoughts'
            })
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property(
            'message',
            'difficulty: Invalid value'
        )
    })

    it('should return 400 on missing request data', async () => {
        for (const field of ['difficulty', 'title', 'thoughts']) {
            const data = {
                difficulty: 'easy',
                title: 'Title',
                thoughts: 'Thoughts'
            }

            delete data[field as keyof typeof data]

            const res = await request(API_HOST)
                .post('/achievements/entries')
                .set('Authorization', `Bearer ${PBAuthToken}`)
                .send(data)
                .expect(400)

            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('state', 'error')
            expect(res.body).to.have.property(
                'message',
                `${field}: Invalid value`
            )
        }
    })
})

describe('PATCH /achievements/entries/:id', () => {
    testUnauthorized('/achievements/entries/1', 'patch')

    it('should update an achievement entry', async () => {
        const data = {
            difficulty: 'easy',
            title: lorem.generateWords(3),
            thoughts: lorem.generateWords(10)
        }

        const entry = await PBClient.collection('achievements_entries').create(
            data
        )

        const res = await request(API_HOST)
            .patch(`/achievements/entries/${entry.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send({
                difficulty: 'medium',
                title: 'New title',
                thoughts: 'New thoughts'
            })
            .expect(200)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('object')

        const updatedEntry = res.body.data

        assert(
            AchievementsEntrySchema.is(updatedEntry),
            'Invalid schema for achievements entry'
        )

        expect(updatedEntry.title).to.equal('New title')
        expect(updatedEntry.thoughts).to.equal('New thoughts')

        await PBClient.collection('achievements_entries').delete(entry.id)
    })

    it('should return 400 on missing difficulty', async () => {
        const entry = await PBClient.collection('achievements_entries').create({
            difficulty: 'easy',
            title: 'Title',
            thoughts: 'Thoughts'
        })

        const res = await request(API_HOST)
            .patch(`/achievements/entries/${entry.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send({
                difficulty: 'invalid',
                title: 'New title',
                thoughts: 'New thoughts'
            })
            .expect(400)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property(
            'message',
            'difficulty: Invalid value'
        )

        await PBClient.collection('achievements_entries').delete(entry.id)
    })

    it('should return 400 on missing request', async () => {
        const entry = await PBClient.collection('achievements_entries').create({
            difficulty: 'easy',
            title: 'Title',
            thoughts: 'Thoughts'
        })

        for (const field of ['difficulty', 'title', 'thoughts']) {
            const data = {
                difficulty: 'easy',
                title: 'Title',
                thoughts: 'Thoughts'
            }

            delete data[field as keyof typeof data]

            const res = await request(API_HOST)
                .patch(`/achievements/entries/${entry.id}`)
                .set('Authorization', `Bearer ${PBAuthToken}`)
                .send(data)
                .expect(400)

            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('state', 'error')
            expect(res.body).to.have.property(
                'message',
                `${field}: Invalid value`
            )
        }

        await PBClient.collection('achievements_entries').delete(entry.id)
    })

    it('should return 404 if entry is not found', async () => {
        const res = await request(API_HOST)
            .patch('/achievements/entries/1')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .send({
                difficulty: 'easy',
                title: 'Title',
                thoughts: 'Thoughts'
            })
            .expect(404)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'Entry not found')
    })
})

describe('DELETE /achievements/entries/:id', () => {
    testUnauthorized('/achievements/entries/1', 'delete')

    it('should delete an achievement entry', async () => {
        const entry = await PBClient.collection('achievements_entries').create({
            difficulty: 'easy',
            title: 'Title',
            thoughts: 'Thoughts'
        })

        const res = await request(API_HOST)
            .delete(`/achievements/entries/${entry.id}`)
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(410)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'success')

        await PBClient.collection('achievements_entries')
            .getOne(entry.id)
            .then(() => {
                throw new Error('Entry still exists in database')
            })
            .catch(() => {})
    })

    it('should return 404 if entry is not found', async () => {
        const res = await request(API_HOST)
            .delete('/achievements/entries/1')
            .set('Authorization', `Bearer ${PBAuthToken}`)
            .expect(404)

        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('state', 'error')
        expect(res.body).to.have.property('message', 'Entry not found')
    })
})
