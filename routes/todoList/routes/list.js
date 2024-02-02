const express = require("express")
const router = express.Router()

router.get("/list", async (req, res) => {
    try {
        const { pb } = req;
        const categories = await pb.collection("todo_list").getFullList();
        res.json({
            state: "success",
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
})

router.put("/create", async (req, res) => {
    try {
        const { pb } = req;
        const category = await pb.collection("todo_list").create(req.body);
        res.json({
            state: "success",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            state: "error",
            message: error.message,
        });
    }
})

module.exports = router