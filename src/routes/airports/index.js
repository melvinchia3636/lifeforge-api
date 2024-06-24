import express from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { clientError, success } from '../../utils/response.js'
import JSDOM from 'jsdom'

const cache = new Map()
const cacheTime = 1000 * 60 * 60

const router = express.Router()

router.get(
    '/continents',
    asyncWrapper(async (req, res) => {
        const TARGET = 'https://ourairports.com/airports.html'
        if (
            cache.has('continents') &&
            new Date() - cache.get('continents').lastFetch < cacheTime
        ) {
            success(res, cache.get('continents').data)
            return
        }

        const rawData = await fetch(TARGET).then(res => res.text())

        const dom = new JSDOM.JSDOM(rawData)

        const result = Object.fromEntries(
            Array.from(dom.window.document.querySelectorAll('.geo.listing'))
                .map(e =>
                    e.textContent
                        .trim()
                        .split('\n')
                        .map(e => e.trim())
                )
                .map(([name, count]) => [
                    name,
                    parseInt(count.replace(/,|\(/g, ''))
                ])
        )
        cache.set('continents', {
            data: result,
            lastFetch: new Date()
        })

        success(res, result)
    })
)

router.get(
    '/countries/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params

        if (!['AF', 'AN', 'AS', 'EU', 'NA', 'OC', 'SA'].includes(id)) {
            clientError(res, 'Invalid continent')
            return
        }

        const continentID = `countries/${id}`

        const TARGET = `https://ourairports.com/continents/${id}/`
        if (
            cache.has(continentID) &&
            new Date() - cache.get(continentID).lastFetch < cacheTime
        ) {
            success(res, cache.get(continentID).data)
            return
        }

        const rawData = await fetch(TARGET).then(res => res.text())

        const dom = new JSDOM.JSDOM(rawData)

        const result = Object.fromEntries(
            Array.from(dom.window.document.querySelectorAll('.geo.listing'))
                .map(e => [
                    e.querySelector('img').src.match(/\/([A-Z]+)\.png/)[1],
                    ...e.textContent
                        .trim()
                        .split('\n')
                        .map(e => e.trim())
                ])
                .map(([img, name, count]) => [
                    name,
                    [img, parseInt(count.replace(/,|\(/g, ''))]
                ])
        )

        cache.set(continentID, {
            data: result,
            lastFetch: new Date()
        })

        success(res, result)
    })
)

router.get(
    '/regions/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params

        const countryID = `regions/${id}`

        if (
            cache.has(countryID) &&
            new Date() - cache.get(countryID).lastFetch < cacheTime
        ) {
            success(res, cache.get(countryID).data)
            return
        }

        const rawData = await fetch(
            `https://ourairports.com/countries/${id}/airports.html`
        ).then(res => res.text())

        const dom = new JSDOM.JSDOM(rawData)

        const result = Object.fromEntries(
            Array.from(dom.window.document.querySelectorAll('.geo.listing'))
                .map(e => [
                    e
                        .querySelector('a')
                        .href.split('/')
                        .filter(e => e)
                        .pop(),
                    ...e.textContent
                        .trim()
                        .split('\n')
                        .map(e => e.trim())
                ])
                .map(([id, name, count]) => [
                    name,
                    [id, parseInt(count.replace(/,|\(/g, ''))]
                ])
        )

        const breadcrumbs = Array.from(
            dom.window.document.querySelectorAll(
                'nav[aria-label="breadcrumb"] li'
            )
        ).map(e => e.textContent.trim())

        cache.set(countryID, {
            data: {
                data: result,
                breadcrumbs
            },
            lastFetch: new Date()
        })

        success(res, {
            data: result,
            breadcrumbs
        })
    })
)

router.get(
    '/airports/:countryID/:regID',
    asyncWrapper(async (req, res) => {
        const { countryID, regID } = req.params

        const regionID = `airports/${countryID}/${regID}`

        if (
            cache.has(regionID) &&
            new Date() - cache.get(regionID).lastFetch < cacheTime
        ) {
            success(res, cache.get(regionID).data)
            return
        }

        const rawData = await fetch(
            `https://ourairports.com/countries/${countryID}/${regID}/airports.html`
        ).then(res => res.text())

        const dom = new JSDOM.JSDOM(rawData)

        const result = Array.from(
            dom.window.document.querySelectorAll('.airport.listing.row')
        ).map(e => {
            const name = e.querySelector('h3').textContent.trim()
            const location = e.querySelector('p.text-muted').textContent.trim()
            const type = e.querySelector('img').alt.replace(' marker', '')
            const id = e.querySelector('a').href.match(/\/airports\/(.+)\//)[1]

            return {
                name,
                location,
                type,
                id
            }
        })

        const breadcrumbs = Array.from(
            dom.window.document.querySelectorAll(
                'nav[aria-label="breadcrumb"] li'
            )
        ).map(e => e.textContent.trim())

        cache.set(regionID, {
            data: {
                data: result,
                breadcrumbs: breadcrumbs
            },
            lastFetch: new Date()
        })

        success(res, {
            data: result,
            breadcrumbs
        })
    })
)

export default router
