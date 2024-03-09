const express = require('express')
const router = express.Router()

router.use("/label", require("./routes/label"))
router.use("/language", require("./routes/language"))
router.use("/entry", require("./routes/entry"))

module.exports = router