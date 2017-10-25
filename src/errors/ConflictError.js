import Error from './Error';

export default class ConflictError extends Error {
    constructor(code, message, exception) {
        super(code, message, exception);
        this.status = 409;
    }
}