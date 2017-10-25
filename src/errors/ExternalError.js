import Error from './Error';

export default class BadParamError extends Error {
    constructor(code, message, exception) {
        super(code, message, exception);
        this.status = 500;
    }
}