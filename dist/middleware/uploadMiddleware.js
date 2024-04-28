"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _multer = _interopRequireDefault(require("multer"));
var _uuid = require("uuid");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
// Configure multer storage and file name
var storage = _multer["default"].diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function filename(req, file, cb) {
    cb(null, "".concat((0, _uuid.v4)(), "-").concat(file.originalname));
  }
});

// Create multer upload instance
var upload = (0, _multer["default"])({
  storage: storage,
  limits: {
    fileSize: 100000000
  }
});

// Custom file upload middleware
var uploadMiddleware = function uploadMiddleware(req, res, next) {
  // Use multer upload instance
  upload.array('files', 50)(req, res, function (err) {
    // Proceed to the next middleware or route handler
    next();
  });
};
var _default = exports["default"] = uploadMiddleware;