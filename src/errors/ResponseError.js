import _ from 'lodash';
import {AbstractError} from 'yan-error-class';

/**
 * Exception
 */
export default class ResponseError extends AbstractError {
    constructor(status, obj) {
        super(obj);
        _.defaults(this, {
            status: status || 500
        });
    }
}