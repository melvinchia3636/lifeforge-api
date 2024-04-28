"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _chalk = _interopRequireDefault(require("chalk"));
var _morgan = _interopRequireDefault(require("morgan"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var m = (0, _morgan["default"])(function (tokens, req, res) {
  return [_chalk["default"].hex('#34ace0').bold(tokens.method(req, res)), _chalk["default"].hex('#ffb142').bold(tokens.status(req, res)), _chalk["default"].hex('#ff5252').bold(tokens.url(req, res)), _chalk["default"].hex('#2ed573').bold("".concat(tokens['response-time'](req, res), " ms")), _chalk["default"].hex('#f78fb3').bold("@ ".concat(tokens.date(req, res))), _chalk["default"].yellow(tokens['remote-addr'](req, res))].join(' ');
});
var _default = exports["default"] = m;