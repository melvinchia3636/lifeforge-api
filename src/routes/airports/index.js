import express from 'express'
import asyncWrapper from '../../utils/asyncWrapper.js'
import { clientError, success } from '../../utils/response.js'
import JSDOM from 'jsdom'
import fs from 'fs'
import COUNTRIES from './data/countries.js'
import REGIONS from './data/regions.js'
import metarParser from 'aewx-metar-parser'
import notamnDecoder from './notamdecoder.js'
import FIRs from './data/FIRs.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const AIRPORT_DATA = JSON.parse(
    fs.readFileSync('src/routes/airports/data/airports.json')
).slice(1)

const cache = new Map()
const cacheTime = 1000 * 60 * 60

const router = express.Router()

router.get(
    '/search',
    asyncWrapper(async (req, res) => {
        let { query } = req.query

        if (!query) {
            clientError(res, 'Query is required')
            return
        }

        query = decodeURIComponent(query).toLowerCase()

        const result = AIRPORT_DATA.filter(airport => {
            const continentName = {
                AF: 'Africa',
                AN: 'Antarctica',
                AS: 'Asia',
                EU: 'Europe',
                NA: 'North America',
                OC: 'Oceania',
                SA: 'South America'
            }[airport[7]]
            const countryName = COUNTRIES[airport[8]]?.toLowerCase()
            const regionName = REGIONS[airport[9]].toLowerCase()
            const locationName = airport[10].toLowerCase()
            const airportName = airport[3].toLowerCase()
            const icao = airport[12].toLowerCase()
            const iata = airport[13].toLowerCase()

            return (
                continentName.includes(query) ||
                countryName?.includes(query) ||
                regionName.includes(query) ||
                locationName.includes(query) ||
                airportName.includes(query) ||
                iata.includes(query) ||
                icao.includes(query)
            )
        })
            .map(airport => ({
                id: airport[1],
                name: airport[3],
                continentCode: airport[7],
                country: {
                    code: airport[8],
                    name: COUNTRIES[airport[8]]
                },
                region: {
                    code: airport[9],
                    name: REGIONS[airport[9]]
                },
                locationName: airport[10],
                iata: airport[13],
                icao: airport[12],
                type: airport[2],
                match: (() => {
                    const continentName = {
                        AF: 'Africa',
                        AN: 'Antarctica',
                        AS: 'Asia',
                        EU: 'Europe',
                        NA: 'North America',
                        OC: 'Oceania',
                        SA: 'South America'
                    }[airport[7]].toLowerCase()
                    const countryName = COUNTRIES[airport[8]]?.toLowerCase()
                    const regionName = REGIONS[airport[9]].toLowerCase()
                    const locationName = airport[10].toLowerCase()
                    const airportName = airport[3].toLowerCase()
                    const icao = airport[12].toLowerCase()
                    const iata = airport[13].toLowerCase()

                    if (iata.includes(query)) return 'iata'
                    if (icao.includes(query)) return 'icao'
                    if (airportName.includes(query)) return 'name'
                    if (locationName.includes(query)) return 'location'
                    if (regionName.includes(query)) return 'region'
                    if (countryName.includes(query)) return 'country'
                    if (continentName.includes(query)) return 'continent'
                })()
            }))
            .sort(
                (a, b) =>
                    [
                        'large_airport',
                        'medium_airport',
                        'small_airport',
                        'heliport',
                        'seaplane_base',
                        'balloonport',
                        'closed'
                    ].indexOf(a.type) -
                    [
                        'large_airport',
                        'medium_airport',
                        'small_airport',
                        'heliport',
                        'seaplane_base',
                        'balloonport',
                        'closed'
                    ].indexOf(b.type)
            )
            .sort((a, b) => {
                return (
                    [
                        'iata',
                        'icao',
                        'name',
                        'location',
                        'region',
                        'country',
                        'continent'
                    ].indexOf(a.match) -
                    [
                        'iata',
                        'icao',
                        'name',
                        'location',
                        'region',
                        'country',
                        'continent'
                    ].indexOf(b.match)
                )
            })
            .slice(0, 10)

        success(res, result)
    })
)

router.get(
    '/continents',
    asyncWrapper(async (req, res) => {
        const result = AIRPORT_DATA.reduce((acc, airport) => {
            if (!acc[airport[7]]) {
                acc[airport[7]] = 1
            } else {
                acc[airport[7]]++
            }

            return acc
        }, {})

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

        const result = AIRPORT_DATA.reduce((acc, airport) => {
            if (airport[7] === id) {
                const country = airport[8]
                if (!acc[country]) {
                    acc[country] = 1
                } else {
                    acc[country]++
                }
            }

            return acc
        }, {})

        const final = Object.fromEntries(
            Object.keys(result).map(country => [
                country,
                [COUNTRIES[country], result[country]]
            ])
        )

        success(res, final)
    })
)

router.get(
    '/regions/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params

        const result = AIRPORT_DATA.reduce((acc, airport) => {
            if (airport[8] === id) {
                const region = airport[9]
                if (!acc[region]) {
                    acc[region] = 1
                } else {
                    acc[region]++
                }
            }

            return acc
        }, {})

        const final = Object.fromEntries(
            Object.keys(result).map(region => [
                region,
                [REGIONS[region], result[region]]
            ])
        )

        const breadcrumbs = [COUNTRIES[Object.keys(final)[0].split('-')[0]]]

        success(res, {
            data: final,
            breadcrumbs
        })
    })
)

router.get(
    '/airports/:id',
    asyncWrapper(async (req, res) => {
        const { id } = req.params

        const result = AIRPORT_DATA.filter(airport => airport[9] === id).map(
            airport => ({
                id: airport[1],
                location: airport[10],
                type: airport[2],
                name: airport[3]
            })
        )

        const breadcrumbs = [COUNTRIES[id.split('-')[0]], REGIONS[id]]

        success(res, {
            data: result,
            breadcrumbs
        })
    })
)

router.get(
    '/airport/:airportID',
    asyncWrapper(async (req, res) => {
        const { airportID } = req.params

        const result = AIRPORT_DATA.find(airport => airport[1] === airportID)

        const final = {
            id: result[1],
            type: result[2],
            name: result[3],
            iata: result[13],
            icao: result[12],
            latitude: result[4],
            longitude: result[5],
            elevation: result[6],
            website: result[15],
            wikipedia: result[16],
            has_airline_service: result[11] === 'yes'
        }

        const breadcrumbs = [
            COUNTRIES[result[8]],
            REGIONS[result[9]],
            result[10],
            final.name
        ]

        success(res, {
            data: final,
            breadcrumbs
        })
    })
)

router.get(
    '/airport/:airportID/flights/:type',
    asyncWrapper(async (req, res) => {
        const { airportID, type } = req.params
        const { page } = req.query

        if (!['arrivals', 'departures'].includes(type)) {
            clientError(res, 'Invalid type')
            return
        }

        if (page && isNaN(parseInt(page))) {
            clientError(res, 'Invalid page')
            return
        }

        const flightIDKey = `airport/${airportID}/flights/${type}/${page}`

        if (
            cache.has(flightIDKey) &&
            new Date() - cache.get(flightIDKey).lastFetch < 1000 * 60
        ) {
            success(res, cache.get(flightIDKey).data)
            return
        }

        const rawData = await fetch(
            `https://www.avionio.com/widget/en/${airportID}/${type}?page=${page || 0}`
        ).then(res => res.text())

        const dom = new JSDOM.JSDOM(rawData)

        const flights = []
        dom.window.document.querySelectorAll('.tt-row').forEach(row => {
            if (row.classList.contains('tt-child')) return

            const flight = {
                time: row.querySelector('.tt-t').textContent.trim(),
                date: row.querySelector('.tt-d').textContent.trim(),
                origin: {
                    iata: row
                        .querySelector('.tt-i a')
                        .title.replace(/ •.*$/, ''),
                    name: row.querySelector('.tt-ap').textContent.trim()
                },
                flightNumber: row.querySelector('.tt-f a').textContent.trim(),
                airline: row
                    .querySelector('.tt-al')
                    .textContent.replace(/\s+\d+$/, '')
                    .trim(),
                status: row.querySelector('.tt-s').textContent.trim()
            }

            const timeDetails = row.querySelector('.tt-s')
            if (timeDetails.classList.contains('estimated')) {
                flight.estimatedTime = timeDetails.textContent
                    .replace('Estimated ', '')
                    .trim()
            } else if (timeDetails.classList.contains('scheduled')) {
                flight.scheduledTime = timeDetails.textContent
                    .replace('Scheduled ', '')
                    .trim()
            }

            flights.push(flight)
        })

        cache.set(flightIDKey, {
            data: flights,
            lastFetch: new Date()
        })

        success(res, flights)
    })
)

router.get(
    '/airport/:airportID/METAR',
    asyncWrapper(async (req, res) => {
        const { airportID } = req.params
        try {
            const response = await fetch(
                `https://metar-taf.com/${airportID}`
            ).then(res => res.text())

            const dom = new JSDOM.JSDOM(response)

            const metar = dom.window.document.querySelector('code').textContent

            const parsedMETAR = metarParser(metar)

            success(res, parsedMETAR)
        } catch {
            try {
                const response = await fetch(
                    `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${airportID}.TXT`
                ).then(res => res.text())

                const data = response.trim()
                const metar = data.split('\n')[1]

                const parsedMETAR = metarParser(metar)

                success(res, parsedMETAR)
            } catch {
                success(res, 'none')
            }
        }
    })
)

router.get(
    '/airport/:airportID/NOTAM',
    asyncWrapper(async (req, res) => {
        const { airportID } = req.params
        const page = req.query.page ?? '-1'

        try {
            const response = await fetch(
                `https://metar-taf.com/notams/${airportID}?page=${page}`
            ).then(res => res.text())

            if (response === 'DONE') {
                success(res, [])
                return
            }

            const dom = new JSDOM.JSDOM(response)

            const NOTAMs = Array.from(
                dom.window.document.querySelectorAll('a')
            ).map(e => {
                const title = e.querySelector('h5')
                const status = title.nextElementSibling
                const distance = status.nextElementSibling
                const time = distance.nextElementSibling
                const codeSummary = e.querySelector('pre')
                const duration = codeSummary.nextSibling

                return {
                    id: e.href.replace('/notam/', ''),
                    title: title.innerHTML
                        .replace(/<.*?span.*?>/g, '')
                        .split('·')
                        .map(e => e.trim()),
                    status: status.innerHTML,
                    distance: distance.innerHTML.trim(),
                    time: time.innerHTML.replace('&gt;', '>'),
                    codeSummary: codeSummary.innerHTML,
                    duration: duration.data.trim()
                }
            })

            success(res, NOTAMs)
        } catch (err) {
            console.log(err)
            success(res, 'none')
        }
    })
)

router.get(
    '/NOTAM/:NOTAMID',
    asyncWrapper(async (req, res) => {
        const { NOTAMID } = req.params
        try {
            const response = await fetch(
                `https://metar-taf.com/notam/${NOTAMID}?frame=1`
            ).then(res => res.text())

            const dom = new JSDOM.JSDOM(response)

            const NOTAM = dom.window.document.querySelector('pre').innerHTML

            const result = notamnDecoder.decode(NOTAM)

            result.raw = NOTAM

            if (result.qualification && result.qualification.location) {
                result.qualification.location = [
                    result.qualification.location,
                    FIRs[result.qualification.location]
                ]
            }

            success(res, result)
        } catch (err) {
            success(res, 'none')
        }
    })
)

router.get(
    '/NOTAM/:NOTAMID/summarize',
    asyncWrapper(async (req, res) => {
        const { NOTAMID } = req.params

        const response = await fetch(
            `https://metar-taf.com/notam/${NOTAMID}?frame=1`
        ).then(res => res.text())

        const dom = new JSDOM.JSDOM(response)

        const NOTAM = dom.window.document.querySelector('pre').innerHTML

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash'
        })

        const prompt = `
            Please summarize the following NOTAM (Notice to Airmen) data into a concise and easy-to-understand format, including:

                Location
                Dates and times of operation
                Type of activity or operation
                Coordinates or area affected
                Altitude or height restrictions
                Any additional remarks or notes

            Please provide a clear and concise summary that can be easily understood by pilots, air traffic controllers, and other aviation professionals.
            
            ${NOTAM}
            `

        let MAX_RETRY = 5

        while (MAX_RETRY > 0) {
            try {
                const result = await model.generateContent(prompt)
                const final = result.response
                const text = final.text()

                success(res, text)
                return
            } catch {
                MAX_RETRY--
                continue
            }
        }
    })
)

router.get(
    '/airport/:airportID/radios',
    asyncWrapper(async (req, res) => {
        const { airportID } = req.params

        const response = await fetch(
            `https://www.liveatc.net/search/?icao=${airportID}`
        ).then(res => res.text())

        const dom = new JSDOM.JSDOM(response)

        const radios = Array.from(
            dom.window.document.querySelectorAll('.freqTable tr')
        )
            .slice(1)
            .map(radio => {
                const [name, frequency] = radio.querySelectorAll('td')

                return {
                    name: name.textContent,
                    frequency: frequency.textContent
                }
            })

        success(res, radios)
    })
)

router.get(
    '/airport/:airportID/runways',
    asyncWrapper(async (req, res) => {
        const { airportID } = req.params

        const response = await fetch(
            `https://www.airport-data.com/world-airports/${airportID}`
        ).then(res => res.text())

        const dom = new JSDOM.JSDOM(response)

        const runwayNames = Array.from(
            dom.window.document.querySelectorAll('section#runway h3')
        ).map(e => e.textContent)

        const runwaysInfo = Array.from(
            dom.window.document.querySelectorAll('section#runway table')
        ).map(table =>
            table.outerHTML
                .replace(/class=".*?"/g, '')
                .replace(/width=".*?"/g, '')
        )

        const runways = runwayNames.map((name, i) => ({
            name,
            info: runwaysInfo[i]
        }))

        success(res, runways)
    })
)

export default router
