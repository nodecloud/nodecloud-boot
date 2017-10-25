'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Error = require('./Error');

var _Error2 = _interopRequireDefault(_Error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BadParamError extends _Error2.default {
    constructor(code, message, exception) {
        super(code, message, exception);
        this.status = 400;
    }
}
exports.default = BadParamError;