"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _workspace = _interopRequireDefault(require("./routes/workspace.js"));
var _subject = _interopRequireDefault(require("./routes/subject.js"));
var _entry = _interopRequireDefault(require("./routes/entry.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
router.use('/workspace', _workspace["default"]);
router.use('/subject', _subject["default"]);
router.use('/entry', _entry["default"]);
var _default = exports["default"] = router;