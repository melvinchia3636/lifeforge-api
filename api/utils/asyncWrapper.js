"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var asyncWrapper = function asyncWrapper(cb) {
  return function (req, res, next) {
    return cb(req, res, next)["catch"](next);
  };
};
var _default = exports["default"] = asyncWrapper;