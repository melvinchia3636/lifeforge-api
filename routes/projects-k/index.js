const express = require("express")
const router = express.Router()

router.use("/entry", require("./routes/entry"))

module.exports = router