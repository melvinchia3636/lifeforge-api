"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _tag = _interopRequireDefault(require("./routes/tag.js"));
var _deck = _interopRequireDefault(require("./routes/deck.js"));
var _card = _interopRequireDefault(require("./routes/card.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
router.use('/tag', _tag["default"]);
router.use('/deck', _deck["default"]);
router.use('/card', _card["default"]);
var _default = exports["default"] = router;