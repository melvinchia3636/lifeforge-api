const express = require("express")
const router = express.Router()

router.get("/get/:id", async (req, res) => {
    try {
        const { pb } = req
        const { id } = req.params
        const album = await pb.collection("photos_album").getOne(id, {
            expand: "cover"
        })

        if (album.expand) {
            const cover = album.expand.cover
            album.cover = `${cover.collectionId}/${cover.id}/${cover.image}`
            delete album.expand
        }

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

        const albums = await pb.collection("photos_album").getFullList({
            expand: "cover"
        })

        albums.forEach(album => {
            if (album.expand) {
                const cover = album.expand.cover
                album.cover = `${cover.collectionId}/${cover.id}/${cover.image}`
                delete album.expand
            }
        })

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

router.put("/set-cover/:albumId/:imageId", async (req, res) => {
    try {
        const { pb } = req
        const { imageId, albumId } = req.params

        if (!imageId || !albumId) {
            throw new Error("Missing required fields")
        }

        await pb.collection("photos_album").update(albumId, { cover: imageId })

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