"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _fs = _interopRequireDefault(require("fs"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _exifreader = _interopRequireDefault(require("exifreader"));
var _moment = _interopRequireDefault(require("moment"));
var _axios = _interopRequireDefault(require("axios"));
var _response = require("../../../utils/response.js");
var _asyncWrapper = _interopRequireDefault(require("../../../utils/asyncWrapper.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _wrapRegExp() { _wrapRegExp = function _wrapRegExp(e, r) { return new BabelRegExp(e, void 0, r); }; var e = RegExp.prototype, r = new WeakMap(); function BabelRegExp(e, t, p) { var o = RegExp(e, t); return r.set(o, p || r.get(e)), _setPrototypeOf(o, BabelRegExp.prototype); } function buildGroups(e, t) { var p = r.get(t); return Object.keys(p).reduce(function (r, t) { var o = p[t]; if ("number" == typeof o) r[t] = e[o];else { for (var i = 0; void 0 === e[o[i]] && i + 1 < o.length;) i++; r[t] = e[o[i]]; } return r; }, Object.create(null)); } return _inherits(BabelRegExp, RegExp), BabelRegExp.prototype.exec = function (r) { var t = e.exec.call(this, r); if (t) { t.groups = buildGroups(t, this); var p = t.indices; p && (p.groups = buildGroups(p, this)); } return t; }, BabelRegExp.prototype[Symbol.replace] = function (t, p) { if ("string" == typeof p) { var o = r.get(this); return e[Symbol.replace].call(this, t, p.replace(/\$<([^>]+)>/g, function (e, r) { var t = o[r]; return "$" + (Array.isArray(t) ? t.join("$") : t); })); } if ("function" == typeof p) { var i = this; return e[Symbol.replace].call(this, t, function () { var e = arguments; return "object" != _typeof(e[e.length - 1]) && (e = [].slice.call(e)).push(buildGroups(e, i)), p.apply(this, e); }); } return e[Symbol.replace].call(this, t, p); }, _wrapRegExp.apply(this, arguments); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; } /* eslint-disable camelcase */ /* eslint-disable no-shadow */ /* eslint-disable indent */ /* eslint-disable consistent-return */ /* eslint-disable max-len */ /* eslint-disable no-continue */ /* eslint-disable prefer-destructuring */ /* eslint-disable no-await-in-loop */ /* eslint-disable no-param-reassign */ /* eslint-disable no-restricted-syntax */
var router = _express["default"].Router();
var RAW_FILE_TYPE = ['ARW', 'CR2', 'CR3', 'CRW', 'DCR', 'DNG', 'ERF', 'K25', 'KDC', 'MRW', 'NEF', 'ORF', 'PEF', 'RAF', 'RAW', 'SR2', 'SRF', 'X3F'];
var progress = 0;
router.get('/name/:id', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var pb, id, isInAlbum, image, dim;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          pb = req.pb;
          id = req.params.id;
          isInAlbum = req.query.isInAlbum;
          if (!(isInAlbum === 'true')) {
            _context.next = 12;
            break;
          }
          _context.next = 6;
          return pb.collection('photos_entry_dimensions').getOne(id);
        case 6:
          dim = _context.sent;
          _context.next = 9;
          return pb.collection('photos_entry').getOne(dim.photo);
        case 9:
          image = _context.sent;
          _context.next = 15;
          break;
        case 12:
          _context.next = 14;
          return pb.collection('photos_entry').getOne(id);
        case 14:
          image = _context.sent;
        case 15:
          (0, _response.success)(res, image.name);
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()));
router.get('/download/:id', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var pb, id, _req$query, raw, isInAlbum, image, dim, url;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          pb = req.pb;
          id = req.params.id;
          _req$query = req.query, raw = _req$query.raw, isInAlbum = _req$query.isInAlbum;
          if (!(isInAlbum === 'true')) {
            _context2.next = 12;
            break;
          }
          _context2.next = 6;
          return pb.collection('photos_entry_dimensions').getOne(id);
        case 6:
          dim = _context2.sent;
          _context2.next = 9;
          return pb.collection('photos_entry').getOne(dim.photo);
        case 9:
          image = _context2.sent;
          _context2.next = 15;
          break;
        case 12:
          _context2.next = 14;
          return pb.collection('photos_entry').getOne(id);
        case 14:
          image = _context2.sent;
        case 15:
          url = pb.files.getUrl(image, image[raw === 'true' ? 'raw' : 'image']);
          (0, _response.success)(res, {
            url: url,
            fileName: "".concat(image.name, ".").concat(image[raw === 'true' ? 'raw' : 'image'].split('.').pop())
          });
        case 17:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()));
router.post('/bulk-download', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var pb, photos, isInAlbum, _iterator, _step, photo, image, dim, filePath;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          pb = req.pb;
          photos = req.body.photos;
          isInAlbum = req.query.isInAlbum;
          _iterator = _createForOfIteratorHelper(photos);
          _context3.prev = 4;
          _iterator.s();
        case 6:
          if ((_step = _iterator.n()).done) {
            _context3.next = 26;
            break;
          }
          photo = _step.value;
          console.log(photo);
          image = void 0;
          if (!(isInAlbum === "true")) {
            _context3.next = 19;
            break;
          }
          _context3.next = 13;
          return pb.collection('photos_entry_dimensions').getOne(photo);
        case 13:
          dim = _context3.sent;
          _context3.next = 16;
          return pb.collection('photos_entry').getOne(dim.photo);
        case 16:
          image = _context3.sent;
          _context3.next = 22;
          break;
        case 19:
          _context3.next = 21;
          return pb.collection('photos_entry').getOne(photo);
        case 21:
          image = _context3.sent;
        case 22:
          filePath = "/media/".concat(process.env.DATABASE_OWNER, "/database/pb_data/storage/").concat(image.collectionId, "/").concat(image.id, "/").concat(image.image);
          _fs["default"].cpSync(filePath, "/media/".concat(process.env.DATABASE_OWNER, "/uploads/").concat(image.name, ".").concat(image.image.split('.').pop()));
        case 24:
          _context3.next = 6;
          break;
        case 26:
          _context3.next = 31;
          break;
        case 28:
          _context3.prev = 28;
          _context3.t0 = _context3["catch"](4);
          _iterator.e(_context3.t0);
        case 31:
          _context3.prev = 31;
          _iterator.f();
          return _context3.finish(31);
        case 34:
          (0, _response.success)(res);
        case 35:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[4, 28, 31, 34]]);
  }));
  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()));
router.get('/dimensions', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var pb, hideInAlbum, filter, response, _yield$pb$collection$, collectionId, totalItems, photos, groupByDate, firstDayOfYear, firstDayOfMonth, _i, _groupByDate, _groupByDate$_i, key, date, year, _i2, _groupByDate2, _groupByDate2$_i, _key, _date, _year, month;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          pb = req.pb;
          hideInAlbum = req.query.hideInAlbum;
          filter = "is_deleted = false ".concat(hideInAlbum === 'true' ? '&& is_in_album=false' : '', " ");
          _context4.next = 5;
          return pb.collection('photos_entry_dimensions').getList(1, 1, {
            filter: filter
          });
        case 5:
          response = _context4.sent;
          _context4.next = 8;
          return pb.collection('photos_entry').getFirstListItem('name != ""');
        case 8:
          _yield$pb$collection$ = _context4.sent;
          collectionId = _yield$pb$collection$.collectionId;
          totalItems = response.totalItems;
          _context4.next = 13;
          return pb.collection('photos_entry_dimensions').getFullList({
            fields: 'photo, width, height, shot_time',
            filter: filter,
            sort: '-shot_time'
          });
        case 13:
          photos = _context4.sent;
          photos.forEach(function (photo) {
            photo.id = photo.photo;
            photo.shot_time = (0, _moment["default"])(photo.shot_time).format('YYYY-MM-DD');
          });
          groupByDate = Object.entries(photos.reduce(function (acc, photo) {
            var date = photo.shot_time;
            if (acc[date]) {
              acc[date].push(photo);
            } else {
              acc[date] = [photo];
            }
            return acc;
          }, {}));
          firstDayOfYear = {};
          firstDayOfMonth = {};
          for (_i = 0, _groupByDate = groupByDate; _i < _groupByDate.length; _i++) {
            _groupByDate$_i = _slicedToArray(_groupByDate[_i], 1), key = _groupByDate$_i[0];
            date = (0, _moment["default"])(key);
            year = date.year();
            if (!firstDayOfYear[year]) {
              firstDayOfYear[year] = date.format('YYYY-MM-DD');
            } else if (date.isBefore((0, _moment["default"])(firstDayOfYear[year]))) {
              firstDayOfYear[year] = date.format('YYYY-MM-DD');
            }
          }
          _i2 = 0, _groupByDate2 = groupByDate;
        case 20:
          if (!(_i2 < _groupByDate2.length)) {
            _context4.next = 31;
            break;
          }
          _groupByDate2$_i = _slicedToArray(_groupByDate2[_i2], 1), _key = _groupByDate2$_i[0];
          _date = (0, _moment["default"])(_key);
          _year = _date.year();
          month = _date.month();
          if (!(month === (0, _moment["default"])(firstDayOfYear[_year]).month())) {
            _context4.next = 27;
            break;
          }
          return _context4.abrupt("continue", 28);
        case 27:
          if (!firstDayOfMonth["".concat(_year, " -").concat(month, " ")]) {
            firstDayOfMonth["".concat(_year, " -").concat(month + 1, " ")] = _date.format('YYYY-MM-DD');
          } else if (_date.isBefore((0, _moment["default"])(firstDayOfMonth["".concat(_year, " -").concat(month, " ")]))) {
            firstDayOfMonth["".concat(_year, " -").concat(month + 1, " ")] = _date.format('YYYY-MM-DD');
          }
        case 28:
          _i2++;
          _context4.next = 20;
          break;
        case 31:
          (0, _response.success)(res, {
            items: groupByDate,
            firstDayOfYear: firstDayOfYear,
            firstDayOfMonth: firstDayOfMonth,
            totalItems: totalItems,
            collectionId: collectionId
          });
        case 32:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()));
router.get('/list', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var pb, date, hideInAlbum, filter, photos;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          pb = req.pb;
          date = req.query.date;
          if ((0, _moment["default"])(date, 'YYYY-MM-DD', true).isValid()) {
            _context5.next = 4;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            state: 'error',
            message: 'Invalid date format'
          }));
        case 4:
          hideInAlbum = req.query.hideInAlbum;
          filter = "is_deleted = false && shot_time >= '".concat((0, _moment["default"])(date, 'YYYY - MM - DD').startOf('day').utc().format('YYYY - MM - DD HH: mm:ss'), "' && shot_time <= '").concat((0, _moment["default"])(date, 'YYYY-MM-DD').endOf('day').utc().format('YYYY-MM-DD HH:mm:ss'), " ' ").concat(hideInAlbum === 'true' ? ' && album = ""' : '');
          _context5.next = 8;
          return pb.collection('photos_entry_dimensions').getFullList({
            filter: filter,
            expand: 'photo',
            fields: 'expand.photo.raw,is_in_album,is_favourite,expand.photo.id,expand.photo.image'
          });
        case 8:
          photos = _context5.sent;
          photos = photos.map(function (photo) {
            return _objectSpread(_objectSpread({}, photo.expand.photo), {}, {
              is_in_album: photo.is_in_album,
              is_favourite: photo.is_favourite
            });
          });
          photos.forEach(function (photo) {
            photo.has_raw = photo.raw !== '';
            delete photo.raw;
          });
          (0, _response.success)(res, photos);
        case 12:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()));
router.get('/list/:albumId', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var pb, albumId, photos;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          pb = req.pb;
          albumId = req.params.albumId;
          _context6.next = 4;
          return pb.collection('photos_entry_dimensions').getFullList({
            filter: "photo.album = \"".concat(albumId, "\""),
            expand: 'photo',
            fields: 'expand.photo.id,expand.photo.image,expand,shot_time.photo.raw,width,height,id,expand.photo.collectionId',
            sort: '-shot_time'
          });
        case 4:
          photos = _context6.sent;
          photos = photos.map(function (photo) {
            return _objectSpread(_objectSpread({
              width: photo.width,
              height: photo.height
            }, photo.expand.photo), {}, {
              photoId: photo.expand.photo.id,
              id: photo.id,
              has_raw: photo.expand.photo.raw !== '',
              shot_time: photo.shot_time
            });
          });
          photos.forEach(function (photo) {
            delete photo.raw;
          });
          (0, _response.success)(res, photos);
        case 8:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()));
router.post('/import', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var pb, newFiles, distinctFiles, _iterator2, _step2, _file, fileWithoutExtension, completed, _i3, _Object$entries, _Object$entries$_i, key, value, data, rawFiles, imageFiles, filePath, tags, _imageFiles$0$toUpper, dateStr, newEntry, thumbnailImageUrl, _i4, _arr, file;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          pb = req.pb;
          _fs["default"].readdirSync("/media/".concat(process.env.DATABASE_OWNER, "/uploads")).filter(function (file) {
            return file.startsWith('.');
          }).forEach(function (file) {
            return _fs["default"].unlinkSync("/media/".concat(process.env.DATABASE_OWNER, "/uploads/").concat(file));
          });
          newFiles = _fs["default"].readdirSync("/media/".concat(process.env.DATABASE_OWNER, "/uploads")).filter(function (file) {
            return !file.startsWith('.') && ((_mimeTypes["default"].lookup(file) ? _mimeTypes["default"].lookup(file).startsWith('image') : false) || RAW_FILE_TYPE.includes(file.split('.').pop().toUpperCase()));
          });
          if (!(newFiles.length === 0)) {
            _context7.next = 5;
            break;
          }
          return _context7.abrupt("return", res.status(401).json({
            state: 'error',
            message: 'No files are detected in the uploads folder'
          }));
        case 5:
          distinctFiles = {};
          _iterator2 = _createForOfIteratorHelper(newFiles);
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              _file = _step2.value;
              fileWithoutExtension = _file.split('.').slice(0, -1).join('.');
              if (distinctFiles[fileWithoutExtension]) {
                distinctFiles[fileWithoutExtension].push(_file);
              } else {
                distinctFiles[fileWithoutExtension] = [_file];
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          progress = 0;
          completed = 0;
          res.status(202).json({
            state: 'accepted'
          });
          _i3 = 0, _Object$entries = Object.entries(distinctFiles);
        case 12:
          if (!(_i3 < _Object$entries.length)) {
            _context7.next = 63;
            break;
          }
          _Object$entries$_i = _slicedToArray(_Object$entries[_i3], 2), key = _Object$entries$_i[0], value = _Object$entries$_i[1];
          data = {
            name: key
          };
          rawFiles = value.filter(function (file) {
            return RAW_FILE_TYPE.includes(file.split('.').pop().toUpperCase());
          });
          imageFiles = value.filter(function (file) {
            return !RAW_FILE_TYPE.includes(file.split('.').pop().toUpperCase()) && (_mimeTypes["default"].lookup(file) ? _mimeTypes["default"].lookup(file).startsWith('image') : false);
          });
          if (!(imageFiles === 0)) {
            _context7.next = 21;
            break;
          }
          completed += 1;
          progress = completed / Object.keys(distinctFiles).length;
          return _context7.abrupt("continue", 60);
        case 21:
          if (!(imageFiles.length > 0)) {
            _context7.next = 39;
            break;
          }
          filePath = "/media/".concat(process.env.DATABASE_OWNER, "/uploads/").concat(imageFiles[0]);
          data.image = new File([_fs["default"].readFileSync(filePath)], imageFiles[0]);
          tags = void 0;
          _context7.prev = 25;
          _context7.next = 28;
          return _exifreader["default"].load(filePath);
        case 28:
          tags = _context7.sent;
          _context7.next = 34;
          break;
        case 31:
          _context7.prev = 31;
          _context7.t0 = _context7["catch"](25);
          tags = {};
        case 34:
          data.filesize = _fs["default"].statSync(filePath).size;
          if (tags.DateTimeOriginal) {
            data.shot_time = (0, _moment["default"])(tags.DateTimeOriginal.value, 'YYYY:MM:DD HH:mm:ss').toISOString();
          } else {
            dateStr = (_imageFiles$0$toUpper = imageFiles[0].toUpperCase().match( /*#__PURE__*/_wrapRegExp(/IMG\x2D(\d+)\x2DWA.+/, {
              date: 1
            }))) === null || _imageFiles$0$toUpper === void 0 || (_imageFiles$0$toUpper = _imageFiles$0$toUpper.groups) === null || _imageFiles$0$toUpper === void 0 ? void 0 : _imageFiles$0$toUpper.date;
            if (dateStr) {
              data.shot_time = (0, _moment["default"])(dateStr, 'YYYYMMDD').format('YYYY-MM-DD HH:mm:ss');
            } else {
              data.shot_time = (0, _moment["default"])(_fs["default"].statSync(filePath).birthtime).toISOString();
            }
          }
          if (tags.Orientation) {
            if (tags.PixelXDimension && tags.PixelYDimension) {
              data.width = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags.PixelYDimension.value : tags.PixelXDimension.value;
              data.height = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags.PixelXDimension.value : tags.PixelYDimension.value;
            } else if (tags['Image Width'] && tags['Image Height']) {
              data.width = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags['Image Height'].value : tags['Image Width'].value;
              data.height = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags['Image Width'].value : tags['Image Height'].value;
            } else {
              data.width = 0;
              data.height = 0;
            }
          } else if (tags.PixelXDimension && tags.PixelYDimension) {
            data.width = tags.PixelXDimension.value;
            data.height = tags.PixelYDimension.value;
          } else if (tags['Image Width'] && tags['Image Height']) {
            data.width = tags['Image Width'].value;
            data.height = tags['Image Height'].value;
          } else {
            data.width = 0;
            data.height = 0;
          }
          _context7.next = 42;
          break;
        case 39:
          completed += 1;
          progress = completed / Object.keys(distinctFiles).length;
          return _context7.abrupt("continue", 60);
        case 42:
          if (rawFiles.length > 0) {
            data.raw = rawFiles.map(function (file) {
              var buffer = _fs["default"].readFileSync("/media/".concat(process.env.DATABASE_OWNER, "/uploads/").concat(file));
              return new File([buffer], file);
            })[0];
          }
          _context7.next = 45;
          return pb.collection('photos_entry').create(_objectSpread(_objectSpread({
            image: data.image
          }, data.raw ? {
            raw: data.raw
          } : {}), {}, {
            name: data.name
          }), {
            $autoCancel: false
          });
        case 45:
          newEntry = _context7.sent;
          _context7.next = 48;
          return pb.collection('photos_entry_dimensions').create({
            photo: newEntry.id,
            width: data.width,
            height: data.height,
            shot_time: data.shot_time
          });
        case 48:
          thumbnailImageUrl = pb.files.getUrl(newEntry, newEntry.image, {
            thumb: '0x300'
          });
          _context7.prev = 49;
          _context7.next = 52;
          return _axios["default"].get(thumbnailImageUrl);
        case 52:
          _context7.next = 57;
          break;
        case 54:
          _context7.prev = 54;
          _context7.t1 = _context7["catch"](49);
          console.log("Thumbnail doesn't exist");
        case 57:
          for (_i4 = 0, _arr = [].concat(_toConsumableArray(rawFiles), _toConsumableArray(imageFiles)); _i4 < _arr.length; _i4++) {
            file = _arr[_i4];
            _fs["default"].unlinkSync("/media/".concat(process.env.DATABASE_OWNER, "/uploads/").concat(file));
          }
          completed += 1;
          progress = completed / Object.keys(distinctFiles).length;
        case 60:
          _i3++;
          _context7.next = 12;
          break;
        case 63:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[25, 31], [49, 54]]);
  }));
  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()));
router.get('/import/progress', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          (0, _response.success)(res, progress);
        case 1:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()));
router["delete"]('/delete', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    var pb, photos, isInAlbum, _iterator3, _step3, photo, dim, _yield$pb$collection$2, album;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          pb = req.pb;
          photos = req.body.photos;
          isInAlbum = req.query.isInAlbum;
          _iterator3 = _createForOfIteratorHelper(photos);
          _context9.prev = 4;
          _iterator3.s();
        case 6:
          if ((_step3 = _iterator3.n()).done) {
            _context9.next = 31;
            break;
          }
          photo = _step3.value;
          dim = void 0;
          if (!(isInAlbum === 'true')) {
            _context9.next = 15;
            break;
          }
          _context9.next = 12;
          return pb.collection('photos_entry_dimensions').getOne(photo);
        case 12:
          dim = _context9.sent;
          _context9.next = 18;
          break;
        case 15:
          _context9.next = 17;
          return pb.collection('photos_entry_dimensions').getFirstListItem("photo = \"".concat(photo, "\""));
        case 17:
          dim = _context9.sent;
        case 18:
          if (!dim.is_in_album) {
            _context9.next = 27;
            break;
          }
          _context9.next = 21;
          return pb.collection('photos_entry').getOne(dim.photo);
        case 21:
          _yield$pb$collection$2 = _context9.sent;
          album = _yield$pb$collection$2.album;
          _context9.next = 25;
          return pb.collection('photos_album').update(album, {
            'amount-': 1
          });
        case 25:
          _context9.next = 27;
          return pb.collection('photos_entry').update(dim.photo, {
            album: ''
          });
        case 27:
          _context9.next = 29;
          return pb.collection('photos_entry_dimensions').update(dim.id, {
            is_deleted: true,
            is_in_album: false
          });
        case 29:
          _context9.next = 6;
          break;
        case 31:
          _context9.next = 36;
          break;
        case 33:
          _context9.prev = 33;
          _context9.t0 = _context9["catch"](4);
          _iterator3.e(_context9.t0);
        case 36:
          _context9.prev = 36;
          _iterator3.f();
          return _context9.finish(36);
        case 39:
          (0, _response.success)(res);
        case 40:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[4, 33, 36, 39]]);
  }));
  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}()));
var _default = exports["default"] = router;