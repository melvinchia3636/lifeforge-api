"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.success = success;
function success(res) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  res.json({
    state: 'success',
    data: data
  });
}