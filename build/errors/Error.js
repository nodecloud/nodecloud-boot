'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Exception
 */
class BaseError extends Error {
    constructor(code, message = '', exception, status) {
        super(message, exception);
        Object.setPrototypeOf(this, BaseError.prototype);

        this.status = status || 400;
        this.code = code;
    }
}
exports.default = BaseError;