const express = require('express')
const router = express.Router()

router.get("/get/:id", async (req, res) => {
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

        const container = await pb.collection("idea_box_container").getOne(id)
        res.json({
            state: "success",
            data: container
        })
    } catch (error) {
        res.status(500)
            .json({
                state: "error",
                message: error.message
            })
    }
})

router.get("/list", async (req, res) => {
    try {
        const { pb } = req
        const containers = await pb.collection("idea_box_container").getFullList()
        res.json({
            state: "success",
            data: containers
        })
    } catch (error) {
        res.status(500)
            .json({
                state: "error",
                message: error.message
            })
    }

})

router.post("/create", async (req, res) => {
    try {
        const { pb } = req
        const { name, color, icon } = req.body
        const container = await pb.collection("idea_box_container").create({
            name,
            color,
            icon
        })
        res.json({
            state: "success",
            data: container
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

        await pb.collection("idea_box_container").delete(id)

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

        const { name, color, icon } = req.body
        await pb.collection("idea_box_container").update(id, {
            name,
            color,
            icon
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