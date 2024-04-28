"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _master = _interopRequireDefault(require("./routes/master.js"));
var _password = _interopRequireDefault(require("./routes/password.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
/* eslint-disable no-param-reassign */

var router = _express["default"].Router();
router.use('/master', _master["default"]);
router.use('/password', _password["default"]);
var _default = exports["default"] = router;