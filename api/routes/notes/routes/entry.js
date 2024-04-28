"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _fs = _interopRequireDefault(require("fs"));
var _uploadMiddleware = _interopRequireDefault(require("../../../middleware/uploadMiddleware.js"));
var _response = require("../../../utils/response.js");
var _asyncWrapper = _interopRequireDefault(require("../../../utils/asyncWrapper.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; } /* eslint-disable no-continue */ /* eslint-disable no-empty */ /* eslint-disable consistent-return */ /* eslint-disable no-await-in-loop */ /* eslint-disable no-restricted-syntax */
var router = _express["default"].Router();
router.get('/get/:id', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var pb, note;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!req.params.id) {
            res.status(400).json({
              state: 'error',
              message: 'id is required'
            });
          }
          pb = req.pb;
          _context.next = 4;
          return pb.collection('notes_entry').getOne(req.params.id);
        case 4:
          note = _context.sent;
          (0, _response.success)(res, note);
        case 6:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()));
router.get('/list/:subject/*', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var pb, notes;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          pb = req.pb;
          _context2.next = 3;
          return pb.collection('notes_entry').getFullList({
            filter: "subject = \"".concat(req.params.subject, "\" && parent = \"").concat(req.params[0].split('/').pop(), "\"")
          });
        case 3:
          notes = _context2.sent;
          (0, _response.success)(res, notes);
        case 5:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()));
router.get('/valid/:workspace/:subject/*', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var pb, _yield$pb$collection$, totalWorkspaceItems, _yield$pb$collection$2, totalSubjectItems, paths, _iterator, _step, path, _yield$pb$collection$3, totalEntryItems;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          pb = req.pb;
          _context3.next = 3;
          return pb.collection('notes_workspace').getList(1, 1, {
            filter: "id = \"".concat(req.params.workspace, "\"")
          });
        case 3:
          _yield$pb$collection$ = _context3.sent;
          totalWorkspaceItems = _yield$pb$collection$.totalItems;
          _context3.next = 7;
          return pb.collection('notes_subject').getList(1, 1, {
            filter: "id = \"".concat(req.params.subject, "\"")
          });
        case 7:
          _yield$pb$collection$2 = _context3.sent;
          totalSubjectItems = _yield$pb$collection$2.totalItems;
          if (!(!totalWorkspaceItems || !totalSubjectItems)) {
            _context3.next = 12;
            break;
          }
          (0, _response.success)(res, false);
          return _context3.abrupt("return");
        case 12:
          paths = req.params[0].split('/').filter(function (p) {
            return p !== '';
          });
          _iterator = _createForOfIteratorHelper(paths);
          _context3.prev = 14;
          _iterator.s();
        case 16:
          if ((_step = _iterator.n()).done) {
            _context3.next = 27;
            break;
          }
          path = _step.value;
          _context3.next = 20;
          return pb.collection('notes_entry').getList(1, 1, {
            filter: "id = \"".concat(path, "\"")
          });
        case 20:
          _yield$pb$collection$3 = _context3.sent;
          totalEntryItems = _yield$pb$collection$3.totalItems;
          if (totalEntryItems) {
            _context3.next = 25;
            break;
          }
          (0, _response.success)(res, false);
          return _context3.abrupt("return");
        case 25:
          _context3.next = 16;
          break;
        case 27:
          _context3.next = 32;
          break;
        case 29:
          _context3.prev = 29;
          _context3.t0 = _context3["catch"](14);
          _iterator.e(_context3.t0);
        case 32:
          _context3.prev = 32;
          _iterator.f();
          return _context3.finish(32);
        case 35:
          (0, _response.success)(res, true);
        case 36:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[14, 29, 32, 35]]);
  }));
  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()));
router.get('/path/:workspace/:subject/*', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var pb, workspace, subject, paths, result, _iterator2, _step2, path, note;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          pb = req.pb;
          _context4.next = 3;
          return pb.collection('notes_workspace').getOne(req.params.workspace);
        case 3:
          workspace = _context4.sent;
          _context4.next = 6;
          return pb.collection('notes_subject').getOne(req.params.subject);
        case 6:
          subject = _context4.sent;
          paths = req.params[0].split('/').filter(function (p) {
            return p !== '';
          });
          result = [{
            id: workspace.id,
            name: workspace.name
          }, {
            id: subject.id,
            name: subject.title
          }];
          _iterator2 = _createForOfIteratorHelper(paths);
          _context4.prev = 10;
          _iterator2.s();
        case 12:
          if ((_step2 = _iterator2.n()).done) {
            _context4.next = 20;
            break;
          }
          path = _step2.value;
          _context4.next = 16;
          return pb.collection('notes_entry').getOne(path);
        case 16:
          note = _context4.sent;
          result.push({
            id: path,
            name: note.name
          });
        case 18:
          _context4.next = 12;
          break;
        case 20:
          _context4.next = 25;
          break;
        case 22:
          _context4.prev = 22;
          _context4.t0 = _context4["catch"](10);
          _iterator2.e(_context4.t0);
        case 25:
          _context4.prev = 25;
          _iterator2.f();
          return _context4.finish(25);
        case 28:
          (0, _response.success)(res, {
            icon: subject.icon,
            path: result
          });
        case 29:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[10, 22, 25, 28]]);
  }));
  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()));
router.post('/create/folder', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var pb, name, existing, note;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          pb = req.pb;
          name = req.body.name;
          _context5.next = 4;
          return pb.collection('notes_entry').getFullList({
            filter: "name = \"".concat(name, "\" && parent = \"").concat(req.body.parent, "\" && subject = \"").concat(req.body.subject, "\"")
          });
        case 4:
          existing = _context5.sent;
          if (!(existing.length > 0)) {
            _context5.next = 8;
            break;
          }
          res.status(400).json({
            state: 'error',
            message: 'Duplicate name'
          });
          return _context5.abrupt("return");
        case 8:
          _context5.next = 10;
          return pb.collection('notes_entry').create(req.body);
        case 10:
          note = _context5.sent;
          (0, _response.success)(res, note);
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
router.post('/upload/:workspace/:subject/*', _uploadMiddleware["default"], (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var pb, _iterator3, _step3, file, parent, path, name, i, _existing, note, existing, fileBuffer;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          pb = req.pb;
          if (!(req.files.length === 0)) {
            _context6.next = 3;
            break;
          }
          return _context6.abrupt("return", res.status(400).send({
            state: 'error',
            message: 'No files were uploaded.'
          }));
        case 3:
          _iterator3 = _createForOfIteratorHelper(req.files);
          _context6.prev = 4;
          _iterator3.s();
        case 6:
          if ((_step3 = _iterator3.n()).done) {
            _context6.next = 43;
            break;
          }
          file = _step3.value;
          parent = req.params[0].split('/').pop();
          if (!file.originalname.endsWith('.DS_Store')) {
            _context6.next = 12;
            break;
          }
          try {
            _fs["default"].unlinkSync(file.path);
          } catch (error) {}
          return _context6.abrupt("continue", 41);
        case 12:
          file.originalname = decodeURIComponent(file.originalname);
          path = file.originalname.split('/');
          name = path.pop();
          i = 0;
        case 16:
          if (!(i < path.length)) {
            _context6.next = 31;
            break;
          }
          _context6.next = 19;
          return pb.collection('notes_entry').getFullList({
            filter: "name = \"".concat(path[i], "\" && parent = \"").concat(parent, "\" && subject = \"").concat(req.params.subject, "\"")
          });
        case 19:
          _existing = _context6.sent;
          if (!(_existing.length > 0)) {
            _context6.next = 24;
            break;
          }
          parent = _existing[0].id;
          _context6.next = 28;
          break;
        case 24:
          _context6.next = 26;
          return pb.collection('notes_entry').create({
            name: path[i],
            type: 'folder',
            parent: parent,
            subject: req.params.subject
          }, {
            $autoCancel: false
          });
        case 26:
          note = _context6.sent;
          parent = note.id;
        case 28:
          i += 1;
          _context6.next = 16;
          break;
        case 31:
          _context6.next = 33;
          return pb.collection('notes_entry').getFullList({
            filter: "name = \"".concat(name, "\" && parent = \"").concat(parent, "\" && subject = \"").concat(req.params.subject, "\"")
          });
        case 33:
          existing = _context6.sent;
          if (!(existing.length > 0)) {
            _context6.next = 36;
            break;
          }
          return _context6.abrupt("continue", 41);
        case 36:
          if (!_fs["default"].existsSync(file.path)) {
            _context6.next = 41;
            break;
          }
          fileBuffer = _fs["default"].readFileSync(file.path);
          _context6.next = 40;
          return pb.collection('notes_entry').create({
            name: name,
            type: 'file',
            parent: parent,
            subject: req.params.subject,
            file: new File([fileBuffer], name, {
              type: file.mimetype
            })
          }, {
            $autoCancel: false
          });
        case 40:
          try {
            _fs["default"].unlinkSync(file.path);
          } catch (error) {}
        case 41:
          _context6.next = 6;
          break;
        case 43:
          _context6.next = 48;
          break;
        case 45:
          _context6.prev = 45;
          _context6.t0 = _context6["catch"](4);
          _iterator3.e(_context6.t0);
        case 48:
          _context6.prev = 48;
          _iterator3.f();
          return _context6.finish(48);
        case 51:
          (0, _response.success)(res, null);
        case 52:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[4, 45, 48, 51]]);
  }));
  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}()));
router.patch('/update/folder/:id', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var pb, note;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          if (req.params.id) {
            _context7.next = 3;
            break;
          }
          res.status(400).json({
            state: 'error',
            message: 'id is required'
          });
          return _context7.abrupt("return");
        case 3:
          pb = req.pb;
          _context7.next = 6;
          return pb.collection('notes_entry').update(req.params.id, req.body);
        case 6:
          note = _context7.sent;
          (0, _response.success)(res, note);
        case 8:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}()));
router["delete"]('/delete/:id', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var pb;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          if (req.params.id) {
            _context8.next = 3;
            break;
          }
          res.status(400).json({
            state: 'error',
            message: 'id is required'
          });
          return _context8.abrupt("return");
        case 3:
          pb = req.pb;
          _context8.next = 6;
          return pb.collection('notes_entry')["delete"](req.params.id);
        case 6:
          (0, _response.success)(res, null);
        case 7:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}()));
var _default = exports["default"] = router;