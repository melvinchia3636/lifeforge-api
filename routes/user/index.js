const express = require("express")
const router = express.Router()

router.patch("/personalization", async (req, res) => {
    try {
        const { pb } = req
        const { id, data } = req.body
        const user = await pb.collection("users").update(id, data)
        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            state: "error",
            message: error.message
        })
    }
})

module.exports = router