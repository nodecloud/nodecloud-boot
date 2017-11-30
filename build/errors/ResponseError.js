'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _yanErrorClass = require('yan-error-class');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Exception
 */
let ResponseError = class ResponseError extends _yanErrorClass.AbstractError {
    constructor(status, obj) {
        super(obj);
        _lodash2.default.defaults(this, {
            status: status || 500
        });
    }
};
exports.default = ResponseError;