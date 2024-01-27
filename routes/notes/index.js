const express = require("express");
const router = express.Router();

router.use("/workspace", require("./routes/workspace"));
router.use("/subject", require("./routes/subject"));
router.use("/entry", require("./routes/entry"));

module.exports = router;
