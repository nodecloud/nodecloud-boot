/**
 * Exception
 */
export default class BaseError extends Error {
    constructor(code, message = '', exception, status) {
        super(message, exception);
        Object.setPrototypeOf(this, BaseError.prototype);

        this.status = status || 400;
        this.code = code;
    }
}