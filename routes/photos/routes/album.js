const express = require("express")
const router = express.Router()

router.get("/get/:id", async (req, res) => {
    try {
        const { pb } = req
        const { id } = req.params
        const album = await pb.collection("photos_album").getOne(id)

        res.json({
            state: "success",
            data: album
        })
    } catch (e) {
        res.status(500).json({
            state: "error",
            message: e.message
        })
    }
})

router.get("/valid/:id", async (req, res) => {
    try {
        const { pb } = req
        const { id } = req.params
        const { totalItems } = await pb.collection("photos_album").getList(1, 1, {
            filter: `id = "${id}"`
        })

        if (totalItems === 1) {
            res.json({
                state: "success",
                data: true
            })
        } else {
            res.json({
                state: "success",
                data: false
            })
        }
    } catch (e) {
        res.status(500).json({
            state: "error",
            message: e.message
        })
    }
})

router.get("/list", async (req, res) => {
    try {
        const { pb } = req

        const albums = await pb.collection("photos_album").getFullList()
        res.json({
            state: "success",
            data: albums
        })
    } catch (e) {
        res.status(500).json({
            state: "error",
            message: e.message
        })
    }
})

router.post("/create", async (req, res) => {
    try {
        const { pb } = req
        const { name } = req.body
        const album = await pb.collection("photos_album").create({ name })

        res.json({
            state: "success",
            data: album
        })
    } catch (e) {
        res.status(500).json({
            state: "error",
            message: e.message
        })
    }
})

router.patch("/add-photo/:albumId", async (req, res) => {
    try {
        const { pb } = req
        const { albumId } = req.params
        const { photos } = req.body

        for (const photoId of photos) {
            await pb.collection("photos_entry").update(photoId, { album: albumId })
        }

        const { totalItems } = await pb.collection("photos_entry").getList(1, 1, {
            filter: `album = "${albumId}"`
        })

        await pb.collection("photos_album").update(albumId, { amount: totalItems })

        res.json({
            state: "success"
        })

    } catch (e) {
        res.status(500).json({
            state: "error",
            message: e.message
        })
    }
})

router.delete("/delete/:albumId", async (req, res) => {
    try {
        const { pb } = req
        const { albumId } = req.params

        await pb.collection("photos_album").delete(albumId)

        res.json({
            state: "success"
        })

    } catch (e) {
        res.status(500).json({
            state: "error",
            message: e.message
        })
    }
})

module.exports = router