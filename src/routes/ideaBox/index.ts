import express from "express";
import container from "./routes/containers.js";
import folder from "./routes/folders.js";
import idea from "./routes/ideas.js";

const router = express.Router();

router.use("/containers", container);
router.use("/folders", folder);
router.use("/ideas", idea);

export default router;
