const express = require("express")
const router = express.Router()

router.get("/list", async (req, res) => {
    try {
        const { pb } = req;
        const tags = await pb.collection("todo_tag").getFullList();
        res.json({
            state: "success",
            data: tags,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
})

module.exports = router
