const express = require("express")
const router = express.Router()

router.patch("/module", async (req, res) => {
    try {
        const { pb } = req
        const { id, data } = req.body
        const user = await pb.collection("users").update(id, {
            enabledModules: data
        })
        res.json({
            state: "success",
            message: "User updated"
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

router.patch("/personalization", async (req, res) => {
    try {
        const { pb } = req
        const { id, data } = req.body
        const user = await pb.collection("users").update(id, data)
        res.json({
            state: "success",
            message: "User updated successfully",
        })
    } catch (error) {
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

module.exports = router