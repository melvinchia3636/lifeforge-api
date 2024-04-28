"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _response = require("../../utils/response.js");
var _asyncWrapper = _interopRequireDefault(require("../../utils/asyncWrapper.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; } /* eslint-disable indent */ /* eslint-disable no-shadow */ /* eslint-disable no-extend-native */ /* eslint-disable no-restricted-syntax */
var router = _express["default"].Router();
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};
function getDates(startDate, stopDate) {
  var dateArray = [];
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}
router.get('/activities', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var pb, year, firstDayOfYear, lastDayOfYear, data, groupByDate, _iterator, _step, item, date, dateKey, _final, firstRecordEver;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          pb = req.pb;
          year = req.query.year || new Date().getFullYear();
          firstDayOfYear = new Date();
          firstDayOfYear.setMonth(0);
          firstDayOfYear.setDate(1);
          firstDayOfYear.setHours(0);
          firstDayOfYear.setMinutes(0);
          firstDayOfYear.setSeconds(0);
          firstDayOfYear.setFullYear(year);
          lastDayOfYear = new Date();
          lastDayOfYear.setMonth(11);
          lastDayOfYear.setDate(31);
          lastDayOfYear.setHours(23);
          lastDayOfYear.setMinutes(59);
          lastDayOfYear.setSeconds(59);
          lastDayOfYear.setFullYear(year);
          _context.next = 18;
          return pb.collection('code_time').getFullList({
            sort: 'event_time',
            filter: "event_time >= ".concat(firstDayOfYear.getTime(), " && event_time <= ").concat(lastDayOfYear.getTime())
          });
        case 18:
          data = _context.sent;
          groupByDate = {};
          _iterator = _createForOfIteratorHelper(data);
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              item = _step.value;
              date = new Date(item.event_time);
              date.setHours(0);
              date.setMinutes(0);
              date.setSeconds(0);
              dateKey = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-").concat(String(date.getDate()).padStart(2, '0'));
              if (!groupByDate[dateKey]) {
                groupByDate[dateKey] = [];
              }
              groupByDate[dateKey].push(item);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          _final = Object.entries(groupByDate).map(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
              date = _ref3[0],
              items = _ref3[1];
            return {
              date: date,
              count: items.length,
              level: function () {
                var hours = items.length / 60;
                if (hours < 1) {
                  return 1;
                }
                if (hours >= 1 && hours < 3) {
                  return 2;
                }
                if (hours >= 3 && hours < 5) {
                  return 3;
                }
                return 4;
              }()
            };
          });
          if (_final[0].date !== "".concat(firstDayOfYear.getFullYear(), "-").concat(String(firstDayOfYear.getMonth() + 1).padStart(2, '0'), "-").concat(String(firstDayOfYear.getDate()).padStart(2, '0'))) {
            _final.unshift({
              date: "".concat(firstDayOfYear.getFullYear(), "-").concat(String(firstDayOfYear.getMonth() + 1).padStart(2, '0'), "-").concat(String(firstDayOfYear.getDate()).padStart(2, '0')),
              count: 0,
              level: 0
            });
          }
          if (_final[_final.length - 1].date !== "".concat(lastDayOfYear.getFullYear(), "-").concat(String(lastDayOfYear.getMonth() + 1).padStart(2, '0'), "-").concat(String(lastDayOfYear.getDate()).padStart(2, '0'))) {
            _final.push({
              date: "".concat(lastDayOfYear.getFullYear(), "-").concat(String(lastDayOfYear.getMonth() + 1).padStart(2, '0'), "-").concat(String(lastDayOfYear.getDate()).padStart(2, '0')),
              count: 0,
              level: 0
            });
          }
          _context.next = 27;
          return pb.collection('code_time').getList(1, 1, {
            sort: '+event_time'
          });
        case 27:
          firstRecordEver = _context.sent;
          (0, _response.success)(res, {
            data: _final,
            firstYear: new Date(firstRecordEver.items[0].event_time).getFullYear()
          });
        case 29:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()));
router.get('/statistics', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var pb, everything, groupByDate, _iterator2, _step2, item, date, dateKey, mostTimeSpent, total, average, allDates, longestStreak, currentStreak;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          pb = req.pb;
          _context2.next = 3;
          return pb.collection('code_time').getFullList({
            sort: 'event_time'
          });
        case 3:
          everything = _context2.sent;
          groupByDate = {};
          _iterator2 = _createForOfIteratorHelper(everything);
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              item = _step2.value;
              date = new Date(item.event_time);
              date.setHours(0);
              date.setMinutes(0);
              date.setSeconds(0);
              dateKey = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-").concat(String(date.getDate()).padStart(2, '0'));
              if (!groupByDate[dateKey]) {
                groupByDate[dateKey] = 0;
              }
              groupByDate[dateKey] += 1;
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          groupByDate = Object.entries(groupByDate).map(function (_ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
              date = _ref6[0],
              count = _ref6[1];
            return {
              date: date,
              count: count
            };
          });
          groupByDate = groupByDate.sort(function (a, b) {
            if (a.count > b.count) {
              return -1;
            }
            if (a.count < b.count) {
              return 1;
            }
            return 0;
          });
          mostTimeSpent = groupByDate[0].count;
          total = everything.length;
          average = total / groupByDate.length;
          groupByDate = groupByDate.sort(function (a, b) {
            return a.date.localeCompare(b.date);
          });
          allDates = groupByDate.map(function (item) {
            return item.date;
          });
          longestStreak = function () {
            var streak = 0;
            var longest = 0;
            var firstDate = new Date(allDates[0]);
            var lastDate = new Date(allDates[allDates.length - 1]);
            var dates = getDates(firstDate, lastDate);
            var _iterator3 = _createForOfIteratorHelper(dates),
              _step3;
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var date = _step3.value;
                var dateKey = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-").concat(String(date.getDate()).padStart(2, '0'));
                if (allDates.includes(dateKey)) {
                  streak += 1;
                } else {
                  if (streak > longest) {
                    longest = streak;
                  }
                  streak = 0;
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
            return longest;
          }();
          groupByDate = groupByDate.reverse();
          currentStreak = function () {
            var streak = 0;
            var firstDate = new Date(allDates[0]);
            var lastDate = new Date(allDates[allDates.length - 1]);
            var dates = getDates(firstDate, lastDate).reverse();
            var _iterator4 = _createForOfIteratorHelper(dates),
              _step4;
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var date = _step4.value;
                var dateKey = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-").concat(String(date.getDate()).padStart(2, '0'));
                if (allDates.includes(dateKey)) {
                  streak += 1;
                } else {
                  break;
                }
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
            return streak;
          }();
          (0, _response.success)(res, {
            'Most time spent': mostTimeSpent,
            'Total time spent': total,
            'Average time spent': average,
            'Longest streak': longestStreak,
            'Current streak': currentStreak
          });
        case 18:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function (_x3, _x4) {
    return _ref4.apply(this, arguments);
  };
}()));
router.get('/projects', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var pb, lastXDays, date, data, groupByProject, _iterator5, _step5, item;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          pb = req.pb;
          lastXDays = req.query.last || '24 hours';
          if (!(lastXDays > 30)) {
            _context3.next = 5;
            break;
          }
          res.status(400).send({
            state: 'error',
            message: 'lastXDays must be less than 30'
          });
          return _context3.abrupt("return");
        case 5:
          date = new Date();
          _context3.t0 = lastXDays;
          _context3.next = _context3.t0 === '24 hours' ? 9 : _context3.t0 === '7 days' ? 13 : _context3.t0 === '30 days' ? 15 : 17;
          break;
        case 9:
          date.setHours(date.getHours() - 24);
          date.setMinutes(0);
          date.setSeconds(0);
          return _context3.abrupt("break", 19);
        case 13:
          date.setDate(date.getDate() - 7);
          return _context3.abrupt("break", 19);
        case 15:
          date.setDate(date.getDate() - 30);
          return _context3.abrupt("break", 19);
        case 17:
          date.setDate(date.getDate() - 7);
          return _context3.abrupt("break", 19);
        case 19:
          _context3.next = 21;
          return pb.collection('code_time').getFullList({
            filter: "event_time >= ".concat(date.getTime())
          });
        case 21:
          data = _context3.sent;
          groupByProject = {};
          _iterator5 = _createForOfIteratorHelper(data);
          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              item = _step5.value;
              if (!groupByProject[item.project]) {
                groupByProject[item.project] = 0;
              }
              groupByProject[item.project] += 1;
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
          groupByProject = Object.fromEntries(Object.entries(groupByProject).sort(function (_ref8, _ref9) {
            var _ref10 = _slicedToArray(_ref8, 2),
              a = _ref10[1];
            var _ref11 = _slicedToArray(_ref9, 2),
              b = _ref11[1];
            return b - a;
          }));
          (0, _response.success)(res, groupByProject);
        case 27:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function (_x5, _x6) {
    return _ref7.apply(this, arguments);
  };
}()));
router.get('/languages', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var pb, lastXDays, date, data, groupByLanguage, _iterator6, _step6, item;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          pb = req.pb;
          lastXDays = req.query.last || '24 hours';
          if (!(lastXDays > 30)) {
            _context4.next = 5;
            break;
          }
          res.status(400).send({
            state: 'error',
            message: 'lastXDays must be less than 30'
          });
          return _context4.abrupt("return");
        case 5:
          date = new Date();
          _context4.t0 = lastXDays;
          _context4.next = _context4.t0 === '24 hours' ? 9 : _context4.t0 === '7 days' ? 13 : _context4.t0 === '30 days' ? 15 : 17;
          break;
        case 9:
          date.setHours(date.getHours() - 24);
          date.setMinutes(0);
          date.setSeconds(0);
          return _context4.abrupt("break", 19);
        case 13:
          date.setDate(date.getDate() - 7);
          return _context4.abrupt("break", 19);
        case 15:
          date.setDate(date.getDate() - 30);
          return _context4.abrupt("break", 19);
        case 17:
          date.setDate(date.getDate() - 7);
          return _context4.abrupt("break", 19);
        case 19:
          _context4.next = 21;
          return pb.collection('code_time').getFullList({
            filter: "event_time >= ".concat(date.getTime())
          });
        case 21:
          data = _context4.sent;
          groupByLanguage = {};
          _iterator6 = _createForOfIteratorHelper(data);
          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              item = _step6.value;
              if (!groupByLanguage[item.language]) {
                groupByLanguage[item.language] = 0;
              }
              groupByLanguage[item.language] += 1;
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
          groupByLanguage = Object.fromEntries(Object.entries(groupByLanguage).sort(function (_ref13, _ref14) {
            var _ref15 = _slicedToArray(_ref13, 2),
              a = _ref15[1];
            var _ref16 = _slicedToArray(_ref14, 2),
              b = _ref16[1];
            return b - a;
          }));
          (0, _response.success)(res, groupByLanguage);
        case 27:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function (_x7, _x8) {
    return _ref12.apply(this, arguments);
  };
}()));
router.get('/each-day', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var pb, lastDay, firstDay, data, groupByDate, _iterator7, _step7, item, date, dateKey;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          pb = req.pb;
          lastDay = new Date();
          lastDay.setHours(23);
          lastDay.setMinutes(59);
          lastDay.setSeconds(59);

          // 30 days before today
          firstDay = new Date();
          firstDay.setDate(lastDay.getDate() - 30);
          firstDay.setHours(0);
          firstDay.setMinutes(0);
          firstDay.setSeconds(0);
          _context5.next = 12;
          return pb.collection('code_time').getFullList({
            sort: 'event_time',
            filter: "event_time >= ".concat(firstDay.getTime(), " && event_time <= ").concat(lastDay.getTime())
          });
        case 12:
          data = _context5.sent;
          groupByDate = {};
          _iterator7 = _createForOfIteratorHelper(data);
          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              item = _step7.value;
              date = new Date(item.event_time);
              date.setHours(0);
              date.setMinutes(0);
              date.setSeconds(0);
              dateKey = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-").concat(String(date.getDate()).padStart(2, '0'));
              if (!groupByDate[dateKey]) {
                groupByDate[dateKey] = [];
              }
              groupByDate[dateKey].push(item);
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }
          (0, _response.success)(res, Object.entries(groupByDate).map(function (_ref18) {
            var _ref19 = _slicedToArray(_ref18, 2),
              date = _ref19[0],
              items = _ref19[1];
            return {
              date: date,
              duration: items.length * 1000 * 60
            };
          }));
        case 17:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function (_x9, _x10) {
    return _ref17.apply(this, arguments);
  };
}()));
router.get('/stats', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var pb, date, data, groupByDate, _iterator8, _step8, item, _date, dateKey;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          pb = req.pb; // first day of current month
          date = new Date();
          date.setDate(1);
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);
          _context6.next = 9;
          return pb.collection('code_time').getFullList({
            sort: 'event_time',
            filter: "event_time >= ".concat(date.getTime())
          });
        case 9:
          data = _context6.sent;
          groupByDate = {};
          _iterator8 = _createForOfIteratorHelper(data);
          try {
            for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
              item = _step8.value;
              _date = new Date(item.event_time);
              _date.setHours(0);
              _date.setMinutes(0);
              _date.setSeconds(0);
              dateKey = _date.toISOString();
              if (!groupByDate[dateKey]) {
                groupByDate[dateKey] = [];
              }
              groupByDate[dateKey].push(item);
            }
          } catch (err) {
            _iterator8.e(err);
          } finally {
            _iterator8.f();
          }
          (0, _response.success)(res, Object.entries(groupByDate).map(function (_ref21) {
            var _ref22 = _slicedToArray(_ref21, 2),
              date = _ref22[0],
              items = _ref22[1];
            return {
              time: date,
              duration: items.length * 1000 * 60
            };
          }));
          _context6.next = 21;
          break;
        case 16:
          _context6.prev = 16;
          _context6.t0 = _context6["catch"](0);
          console.log(_context6.t0);
          res.status(500);
          res.send({
            state: 'error',
            message: _context6.t0.message
          });
        case 21:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 16]]);
  }));
  return function (_x11, _x12) {
    return _ref20.apply(this, arguments);
  };
}()));
router.post('/eventLog', (0, _asyncWrapper["default"])( /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var pb, data, lastData, language, project;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          pb = req.pb;
          data = req.body;
          data.eventTime = Math.floor(Date.now() / 60000) * 60000;
          _context7.next = 5;
          return pb.collection('code_time').getList(1, 1, {
            sort: 'event_time',
            filter: "event_time = ".concat(data.eventTime)
          });
        case 5:
          lastData = _context7.sent;
          if (!(lastData.totalItems === 0)) {
            _context7.next = 16;
            break;
          }
          pb.collection('code_time').create({
            project: data.project,
            language: data.language,
            event_time: data.eventTime,
            relative_file: data.relativeFile
          });
          _context7.next = 10;
          return pb.collection('code_time_languages').getList(1, 1, {
            sort: 'name',
            filter: "name = '".concat(data.language, "'")
          });
        case 10:
          language = _context7.sent;
          if (language.totalItems === 0) {
            pb.collection('code_time_languages').create({
              name: data.language,
              duration: 1
            });
          } else {
            pb.collection('code_time_languages').update(language.items[0].id, {
              duration: language.items[0].duration + 1
            });
          }
          _context7.next = 14;
          return pb.collection('code_time_projects').getList(1, 1, {
            sort: 'name',
            filter: "name = '".concat(data.project, "'")
          });
        case 14:
          project = _context7.sent;
          if (project.totalItems === 0) {
            pb.collection('code_time_projects').create({
              name: data.project,
              duration: 1
            });
          } else {
            pb.collection('code_time_projects').update(project.items[0].id, {
              duration: project.items[0].duration + 1
            });
          }
        case 16:
          res.send({
            status: 'ok',
            data: [],
            message: 'success'
          });
        case 17:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return function (_x13, _x14) {
    return _ref23.apply(this, arguments);
  };
}()));
var _default = exports["default"] = router;