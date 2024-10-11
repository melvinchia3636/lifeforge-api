import express from "express";
import { createLazyRouter } from "express-lazy-router";

const lazyLoad = createLazyRouter();

const localesRoutes = lazyLoad(() => import("./routes/locales/index.js"));
const userRoutes = lazyLoad(() => import("./routes/user/index.js"));
const projectsMRoutes = lazyLoad(() => import("./routes/projectsM/index.js"));
const todoListRoutes = lazyLoad(() => import("./routes/todoList/index.js"));
const calendarRoutes = lazyLoad(() => import("./routes/calendar/index.js"));
const ideaBoxRoutes = lazyLoad(() => import("./routes/ideaBox/index.js"));
const codeTimeRoutes = lazyLoad(() => import("./routes/codeTime/index.js"));
const booksLibraryRoutes = lazyLoad(
  () => import("./routes/booksLibrary/index.js")
);
const notesRoutes = lazyLoad(() => import("./routes/notes/index.js"));
const flashcardsRoutes = lazyLoad(() => import("./routes/flashcards/index.js"));
const achievementsRoutes = lazyLoad(
  () => import("./routes/achievements/index.js")
);
const spotifyRoutes = lazyLoad(() => import("./routes/spotify/index.js"));
const photosRoutes = lazyLoad(() => import("./routes/photos/index.js"));
const musicRoutes = lazyLoad(() => import("./routes/music/index.js"));
const guitarTabsRoutes = lazyLoad(() => import("./routes/guitarTabs/index.js"));
const repositoriesRoutes = lazyLoad(
  () => import("./routes/repositories/index.js")
);
const passwordsRoutes = lazyLoad(() => import("./routes/passwords/index.js"));
const airportsRoutes = lazyLoad(() => import("./routes/airports/index.js"));
const changiRoutes = lazyLoad(() => import("./routes/changi/index.js"));
const journalRoutes = lazyLoad(() => import("./routes/journal/index.js"));
const serverRoutes = lazyLoad(() => import("./routes/server/index.js"));
const changeLogRoutes = lazyLoad(() => import("./routes/changeLog/index.js"));
const DNSRecordsRoutes = lazyLoad(() => import("./routes/dnsRecords/index.js"));
const mailInboxRoutes = lazyLoad(() => import("./routes/mailInbox/index.js"));
const walletRoutes = lazyLoad(() => import("./routes/wallet/index.js"));
const youtubeVideosRoutes = lazyLoad(
  () => import("./routes/youtubeVideos/index.js")
);
const apiKeysRoutes = lazyLoad(() => import("./routes/apiKeys/index.js"));

const router = express.Router();

router.use("/locales", localesRoutes);
router.use("/user", userRoutes);
router.use("/api-keys", apiKeysRoutes);
router.use("/projects-m", projectsMRoutes);
router.use("/todo-list", todoListRoutes);
router.use("/calendar", calendarRoutes);
router.use("/idea-box", ideaBoxRoutes);
router.use("/code-time", codeTimeRoutes);
router.use("/notes", notesRoutes);
router.use("/books-library", booksLibraryRoutes);
router.use("/flashcards", flashcardsRoutes);
router.use("/journal", journalRoutes);
router.use("/achievements", achievementsRoutes);
router.use("/wallet", walletRoutes);
router.use("/spotify", spotifyRoutes);
router.use("/photos", photosRoutes);
router.use("/music", musicRoutes);
router.use("/guitar-tabs", guitarTabsRoutes);
router.use("/youtube-videos", youtubeVideosRoutes);
router.use("/repositories", repositoriesRoutes);
router.use("/passwords", passwordsRoutes);
router.use("/airports", airportsRoutes);
router.use("/changi", changiRoutes);
router.use("/mail-inbox", mailInboxRoutes);
router.use("/dns-records", DNSRecordsRoutes);
router.use("/server", serverRoutes);
router.use("/change-log", changeLogRoutes);

export default router;
