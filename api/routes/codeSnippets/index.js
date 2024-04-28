"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _label = _interopRequireDefault(require("./routes/label"));
var _language = _interopRequireDefault(require("./routes/language"));
var _entry = _interopRequireDefault(require("./routes/entry"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
router.use('/label', _label["default"]);
router.use('/language', _language["default"]);
router.use('/entry', _entry["default"]);
var _default = exports["default"] = router;