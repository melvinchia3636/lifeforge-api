"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _entry = _interopRequireDefault(require("./routes/entry.js"));
var _list = _interopRequireDefault(require("./routes/list.js"));
var _tag = _interopRequireDefault(require("./routes/tag.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
router.use('/entry', _entry["default"]);
router.use('/list', _list["default"]);
router.use('/tag', _tag["default"]);
var _default = exports["default"] = router;