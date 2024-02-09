const express = require("express")
const router = express.Router()

router.get("/list", async (req, res) => {
    try {
        const { pb } = req
        const projects = await pb.collection("projects_k_entry").getFullList()
        res.json({
            state: "success",
            data: projects
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.get("/get/:id", async (req, res) => {
    try {
        const { pb } = req
        const project = await pb.collection("projects_k_entry").getOne(req.params.id)
        res.json({
            state: "success",
            data: project
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

module.exports = router