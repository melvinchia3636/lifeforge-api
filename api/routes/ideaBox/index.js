"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _container = _interopRequireDefault(require("./routes/container.js"));
var _idea = _interopRequireDefault(require("./routes/idea.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
router.use('/container', _container["default"]);
router.use('/idea', _idea["default"]);
var _default = exports["default"] = router;