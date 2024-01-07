const express = require('express')
const router = express.Router()
const multer = require("multer")

router.get("/list/:containerId", async (req, res) => {
    try {
        const { pb } = req
        const { containerId } = req.params

        if (!containerId) {
            res.status(400)
                .json({
                    state: "error",
                    message: "containerId is required"
                })
            return
        }

        const ideas = await pb.collection("idea_box_entry").getFullList({
            filter: `container = "${containerId}"`,
            sort: "-pinned,-created"
        })
        res.json({
            state: "success",
            data: ideas
        })
    } catch (error) {
        res.status(500)
            .json({
                state: "error",
                message: error.message
            })
    }
})

router.put("/create/:containerId", multer().single("image"), async (req, res) => {
    try {
        const { pb } = req
        const { title, content, link, type } = req.body

        const file = req.file
        const { containerId } = req.params

        if (!containerId) {
            res.status(400)
                .json({
                    state: "error",
                    message: "containerId is required"
                })
            return
        }

        let data;
        switch (type) {
            case "text":
                data = {
                    content,
                    type,
                    container: containerId
                }
                break;
            case "link":
                data = {
                    title,
                    content: link,
                    type,
                    container: containerId
                }
                break;
            case "image":
                data = {
                    title,
                    type,
                    image: new File([file.buffer], file.originalname, { type: file.mimetype }),
                    container: containerId
                }
                break;
        }

        const idea = await pb.collection("idea_box_entry").create(data)
        await pb.collection("idea_box_container").update(containerId, {
            [`${type}_count+`]: 1
        })

        res.json({
            state: "success",
            data: idea
        })

    } catch (error) {
        res.status(500)
            .json({
                state: "error",
                message: error.message
            })
    }
})

router.delete("/delete/:id", async (req, res) => {
    try {
        const { pb } = req
        const { id } = req.params

        if (!id) {
            res.status(400)
                .json({
                    state: "error",
                    message: "id is required"
                })
            return
        }

        const idea = await pb.collection("idea_box_entry").getOne(id)
        await pb.collection("idea_box_entry").delete(id)
        await pb.collection("idea_box_container").update(idea.container, {
            [`${idea.type}_count-`]: 1
        })

        res.json({
            state: "success"
        })
    } catch (error) {
        res.status(500)
            .json({
                state: "error",
                message: error.message
            })
    }
})

router.patch("/update/:id", async (req, res) => {
    try {
        const { pb } = req
        const { id } = req.params

        if (!id) {
            res.status(400)
                .json({
                    state: "error",
                    message: "id is required"
                })
            return
        }

        const { title, content, link, type } = req.body

        let data;
        switch (type) {
            case "text":
                data = {
                    content,
                    type
                }
                break;
            case "link":
                data = {
                    title,
                    content: link,
                    type
                }
                break;
        }

        await pb.collection("idea_box_entry").update(id, data)

        res.json({
            state: "success"
        })

    } catch (error) {
        res.status(500)
            .json({
                state: "error",
                message: error.message
            })
    }
})

router.post("/pin/:id", async (req, res) => {
    try {
        const { pb } = req
        const { id } = req.params

        if (!id) {
            res.status(400)
                .json({
                    state: "error",
                    message: "id is required"
                })
            return
        }

        const idea = await pb.collection("idea_box_entry").getOne(id)
        await pb.collection("idea_box_entry").update(id, {
            pinned: !idea.pinned
        })

        res.json({
            state: "success"
        })
    } catch (error) {
        res.status(500)
            .json({
                state: "error",
                message: error.message
            })
    }
})

module.exports = router