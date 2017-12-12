import _ from 'lodash';
import * as loadbalance from '../loadbalance/loadbalance';
import BrakeClient from 'nodecloud-brakes';
import logger from '../utils/logger';
import * as bootstrap from '../config/bootstrap';

import ResponseError from '../errors/ResponseError';
import {InternalError} from 'yan-error-class';

const cache = {};

//get brake options
const brakeOptions = bootstrap.getConfig('brakes', {enable: true, timeout: 60000});
if (brakeOptions.enable) {
    logger.info('The circuit is enable.');
} else {
    logger.info('The circuit is disable.');
}

//get loadbalance options
const lbOptions = bootstrap.getConfig('loadbalance', {request: {forever: true}});

const handler = {
    postHandle(err, response) {
        if (err && err.statusCode) {
            return err.response || {};
        } else if (err && !err.statusCode) {
            throw err;
        }

        return response;
    },
    postCircuit(response) {
        if (response.statusCode < 300) {
            return response;
        } else {
            const body = response.body || {};

            //If body.message is exist, throw body.message or throw body.
            throw new ResponseError(response.statusCode, {code: body.code, message: body.message || body});
        }
    }
};

function getLbClient(serviceName, options) {
    // new Loadbalance
    return loadbalance.getClient(serviceName, options);
}

function getBrakeClient(serviceName, client, options, healthUrl) {
    const brake = new BrakeClient(serviceName, {handler: handler, ...options});
    brake.fallback(err => {
        logger.error(`Cannot invoke downstream service ${serviceName}. please try again soon.`, err);
        throw new InternalError(`Cannot invoke downstream service ${serviceName}. please try again soon.`);
    });
    brake.on('circuitOpen', () => {
        logger.warn(`The service: ${serviceName}'s circuit is opened.`);
    });
    brake.on('circuitClosed', () => {
        logger.info(`The service: ${serviceName}'s circuit is closed.`);
    });
    brake.healthCheck(() => {
        return client.send({
            method: 'get',
            url: healthUrl || `/health`,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    });

    return brake.circuit(client);
}

export function getBrake(serviceName, options) {
    options = options || {};
    const brake = new BrakeClient(options.brakeName || serviceName, {handler: handler, ...brakeOptions});
    brake.fallback(err => {
        logger.error(`Cannot invoke downstream service ${serviceName}. please try again soon.`, err);
        throw new InternalError(`Cannot invoke downstream service ${serviceName}. please try again soon.`);
    });
    brake.on('circuitOpen', () => {
        logger.warn(`The service: ${serviceName}'s circuit ${options.brakeName || ''} is opened.`);
    });
    brake.on('circuitClosed', () => {
        logger.info(`The service: ${serviceName}'s circuit ${options.brakeName || ''}is closed.`);
    });

    const client = getLbClient(serviceName, lbOptions);
    brake.healthCheck(() => {
        return client.send({
            method: 'get',
            url: options.healthUrl || `/health`,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    });

    return {
        circuit(client) {
            if (brakeOptions.enable) {
                return brake.circuit(client);
            }

            return client;
        }
    };
}

export function getClient(serviceName, healthUrl) {
    if (cache[serviceName]) {
        return cache[serviceName];
    }

    // new Loadbalance
    const client = getLbClient(serviceName, lbOptions);
    if (!brakeOptions.enable) {
        return cache[serviceName] = client;
    }

    // new Brake
    return cache[serviceName] = getBrakeClient(serviceName, client, brakeOptions, healthUrl);
}