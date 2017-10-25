import Error from './Error';

export default class ResourceExistError extends Error {
    constructor(code, message, exception) {
        super(code, message, exception);
        this.status = 400;
    }
}