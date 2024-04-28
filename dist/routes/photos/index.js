"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _entry = _interopRequireDefault(require("./routes/entry.js"));
var _album = _interopRequireDefault(require("./routes/album.js"));
var _albumTag = _interopRequireDefault(require("./routes/album-tag.js"));
var _favourites = _interopRequireDefault(require("./routes/favourites.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
router.use('/entry', _entry["default"]);
router.use('/album', _album["default"]);
router.use('/album/tag', _albumTag["default"]);
router.use('/favourites', _favourites["default"]);
var _default = exports["default"] = router;