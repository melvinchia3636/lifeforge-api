const express = require('express')
const router = express.Router()
const multer = require("multer")

router.get("/list/:containerId", async (req, res) => {
    try {
        const { pb } = req
        const { containerId } = req.params
        const ideas = await pb.collection("idea_box_entry").getFullList({
            filter: `container = "${containerId}"`
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
        await pb.collection("idea_box_entry").delete(id)

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