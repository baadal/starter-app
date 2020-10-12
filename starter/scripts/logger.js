"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var json_stringify_safe_1 = __importDefault(require("json-stringify-safe"));
var colors = {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    fg: {
        Red: '\x1b[31m',
        Yellow: '\x1b[33m',
        Green: '\x1b[32m',
        Blue: '\x1b[34m',
        Magenta: '\x1b[35m',
        Cyan: '\x1b[36m',
    },
};
var print = function (msg, type, newline, padding) {
    if (newline === void 0) { newline = false; }
    if (padding === void 0) { padding = 0; }
    var color = colors.fg.Blue;
    if (type === 'log')
        color = colors.fg.Green;
    else if (type === 'warn')
        color = colors.fg.Yellow;
    else if (type === 'error')
        color = colors.fg.Red;
    else if (type === 'cyan')
        color = colors.fg.Cyan;
    if (typeof process !== typeof undefined && process.stdout) {
        process.stdout.write('  ');
        if (padding)
            process.stdout.write(' '.repeat(padding));
        process.stdout.write(color);
        process.stdout.write(colors.Bright);
        msg.forEach(function (item, idx) {
            var isErrorObj = !!item.name && !!item.message;
            if (typeof item === 'number' || typeof item === 'string' || isErrorObj) {
                if (isErrorObj) {
                    process.stdout.write(item.name + " : " + item.message);
                }
                else {
                    process.stdout.write(item + '');
                }
            }
            else {
                // process.stdout.write(`${item}`);
                process.stdout.write("\n" + json_stringify_safe_1.default(item, null, 2));
            }
            if (idx < msg.length - 1)
                process.stdout.write(' ');
        });
        process.stdout.write(colors.Reset);
        if (newline)
            process.stdout.write('\n');
    }
    else {
        var mlog_1 = '';
        msg.forEach(function (item, idx) {
            if (typeof item === 'number' || typeof item === 'string') {
                mlog_1 += item + '';
            }
            else {
                mlog_1 += "\n" + json_stringify_safe_1.default(item, null, 2);
            }
            if (idx < msg.length - 1)
                mlog_1 += ' ';
        });
        if (type === 'warn')
            console.warn(mlog_1);
        else if (type === 'error')
            console.error(mlog_1);
        else
            console.log(mlog_1);
    }
};
var log_ = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'log');
};
var warn_ = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'warn');
};
var error_ = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'error');
};
var cyan_ = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'cyan');
};
var log = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'log', true);
};
var warn = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'warn', true);
};
var error = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'error', true);
};
var cyan = function () {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    return print(msg, 'cyan', true);
};
exports.default = {
    log_: log_,
    warn_: warn_,
    error_: error_,
    cyan_: cyan_,
    log: log,
    warn: warn,
    error: error,
    cyan: cyan,
};
