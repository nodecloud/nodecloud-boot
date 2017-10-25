import Error from './Error';

export default class NotFoundError extends Error {
    constructor(code, message, exception) {
        super(code, message, exception);
        this.status = 404;
    }
}