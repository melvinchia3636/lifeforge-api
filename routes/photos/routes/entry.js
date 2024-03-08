const express = require("express")
const fs = require('fs')
const mime = require('mime-types');
const ExifReader = require('exifreader');
const moment = require("moment")
const axios = require("axios")
const router = express.Router()

const RAW_FILE_TYPE = [
    "ARW",
    "CR2",
    "CR3",
    "CRW",
    "DCR",
    "DNG",
    "ERF",
    "K25",
    "KDC",
    "MRW",
    "NEF",
    "ORF",
    "PEF",
    "RAF",
    "RAW",
    "SR2",
    "SRF",
    "X3F",
]

var progress = 0

router.get("/list", async (req, res) => {
    try {
        const { pb } = req
        const { totalItems } = await pb.collection("photos_entry").getList(1, 1)
        const photos = await pb.collection("photos_entry").getFullList({
            sort: '-shot_time',
            filter: "is_deleted = false"
        })

        const collectionId = photos[0].collectionId

        photos.forEach((photo) => {
            delete photo.collectionId
            delete photo.collectionName
            delete photo.updated
            delete photo.created
            delete photo.filesize
        })

        const groupByDate = photos.reduce((acc, photo) => {
            const date = moment(photo.shot_time).format("YYYY-MM-DD")
            if (acc[date]) {
                acc[date].push(photo)
            } else {
                acc[date] = [photo]
            }
            return acc
        }, {})

        const firstDayOfYear = {}
        const firstDayOfMonth = {}

        for (const key of Object.keys(groupByDate)) {
            const date = moment(key)
            const year = date.year()
            if (!firstDayOfYear[year]) {
                firstDayOfYear[year] = date.format("YYYY-MM-DD")
            } else {
                if (date.isBefore(moment(firstDayOfYear[year]))) {
                    firstDayOfYear[year] = date.format("YYYY-MM-DD")
                }
            }
        }

        for (const key of Object.keys(groupByDate)) {
            const date = moment(key)
            const year = date.year()
            const month = date.month()
            if (month === moment(firstDayOfYear[year]).month()) {
                continue
            }
            if (!firstDayOfMonth[`${year}-${month}`]) {
                firstDayOfMonth[`${year}-${month}`] = date.format("YYYY-MM-DD")
            } else {
                if (date.isBefore(moment(firstDayOfMonth[`${year}-${month}`]))) {
                    firstDayOfMonth[`${year}-${month}`] = date.format("YYYY-MM-DD")
                }
            }
        }


        res.json({
            state: "success",
            data: {
                items: groupByDate,
                firstDayOfYear,
                firstDayOfMonth,
                totalItems,
                collectionId
            }
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message
        })
    }
})

router.get("/list/:albumId", async (req, res) => {
    try {
        const { pb } = req
        const { albumId } = req.params
        const photos = await pb.collection("photos_entry").getFullList({
            filter: `album = "${albumId}" && is_deleted = false`,
            'sort': '-shot_time'
        })

        res.json({
            state: "success",
            data: photos
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message
        })
    }
})

router.post("/import", async (req, res) => {
    try {
        const { pb } = req
        fs.readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`).filter(file => file.startsWith(".")).forEach(file => fs.unlinkSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`))

        const newFiles = fs.readdirSync(`/media/${process.env.DATABASE_OWNER}/uploads`).filter(file =>
            !file.startsWith(".") && (
                (mime.lookup(file) ? mime.lookup(file).startsWith("image") : false) ||
                RAW_FILE_TYPE.includes(file.split(".").pop().toUpperCase())
            )
        )

        if (newFiles.length === 0) {
            return res.status(401).json({
                state: "error",
                message: "No files are detected in the uploads folder"
            })
        }

        const distinctFiles = {}

        for (const file of newFiles) {
            const fileWithoutExtension = file.split(".").slice(0, -1).join(".")
            if (distinctFiles[fileWithoutExtension]) {
                distinctFiles[fileWithoutExtension].push(file)
            } else {
                distinctFiles[fileWithoutExtension] = [file]
            }
        }

        progress = 0;
        let completed = 0;

        res.status(202).json({
            state: "accepted",
        })

        for (const [key, value] of Object.entries(distinctFiles)) {
            let data = {
                name: key,
            }

            const rawFiles = value.filter(file => RAW_FILE_TYPE.includes(file.split(".").pop().toUpperCase()))
            const imageFiles = value.filter(file => !RAW_FILE_TYPE.includes(file.split(".").pop().toUpperCase()) && (mime.lookup(file) ? mime.lookup(file).startsWith("image") : false))

            if (imageFiles === 0) {
                completed++;
                progress = completed / Object.keys(distinctFiles).length
                continue
            }

            if (imageFiles.length > 0) {
                const filePath = `/media/${process.env.DATABASE_OWNER}/uploads/${imageFiles[0]}`
                data.image = new File([fs.readFileSync(filePath)], imageFiles[0])
                const tags = await ExifReader.load(filePath)

                data.filesize = fs.statSync(filePath).size
                if (tags["DateTimeOriginal"]) {
                    data.shot_time = moment(tags["DateTimeOriginal"].value, "YYYY:MM:DD HH:mm:ss").toISOString()
                } else {
                    data.shot_time = moment(fs.statSync(filePath).birthtime).toISOString()
                }
                if (tags["Orientation"]) {
                    if (tags["PixelXDimension"] && tags["PixelYDimension"]) {
                        data.width = tags["Orientation"].value === 6 || tags["Orientation"].value === 8 ? tags["PixelYDimension"].value : tags["PixelXDimension"].value
                        data.height = tags["Orientation"].value === 6 || tags["Orientation"].value === 8 ? tags["PixelXDimension"].value : tags["PixelYDimension"].value
                    } else if (tags["Image Width"] && tags["Image Height"]) {
                        data.width = tags["Orientation"].value === 6 || tags["Orientation"].value === 8 ? tags["Image Height"].value : tags["Image Width"].value
                        data.height = tags["Orientation"].value === 6 || tags["Orientation"].value === 8 ? tags["Image Width"].value : tags["Image Height"].value
                    } else {
                        data.width = 0
                        data.height = 0
                    }
                } else {
                    if (tags["PixelXDimension"] && tags["PixelYDimension"]) {
                        data.width = tags["PixelXDimension"].value
                        data.height = tags["PixelYDimension"].value
                    } else if (tags["Image Width"] && tags["Image Height"]) {
                        data.width = tags["Image Width"].value
                        data.height = tags["Image Height"].value
                    } else {
                        data.width = 0
                        data.height = 0
                    }
                }

            }

            if (rawFiles.length > 0) {
                data.raw = rawFiles.map(file => {
                    const buffer = fs.readFileSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`);
                    return new File([buffer], file)
                })[0]
            }

            const newEntry = await pb.collection("photos_entry").create(data, { '$autoCancel': false })

            const thumbnailImageUrl = pb.files.getUrl(newEntry, newEntry.image, {
                'thumb': '0x300'
            })

            await axios.get(thumbnailImageUrl)

            for (const file of [...rawFiles, ...imageFiles]) {
                fs.unlinkSync(`/media/${process.env.DATABASE_OWNER}/uploads/${file}`)
            }

            completed++;
            progress = completed / Object.keys(distinctFiles).length
        }
    } catch (error) {
        console.log(error)
        try {
            res.status(500).send({
                state: "error",
                message: error.message
            })
        } catch (e) {
            console.log(e)
        }
    }
})

router.get("/import/progress", (req, res) => {
    res.json({
        state: "success",
        data: progress
    })
})

router.delete("/delete", async (req, res) => {
    try {
        const { pb } = req
        const { photos } = req.body

        for (const photo of photos) {
            await pb.collection("photos_entry").update(photo, {
                'is_deleted': true
            })
        }

        res.json({
            state: "success",
            message: "Photos have been deleted"
        })
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message
        })
    }
})


module.exports = router