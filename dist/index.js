"use strict";

var _app = _interopRequireDefault(require("./app"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
_app["default"].listen(process.env.PORT, function () {
  console.log("Server running on port ".concat(process.env.PORT));
});