import _ from 'lodash';
import * as loadbalance from '../loadbalance/loadbalance';
import BrakeClient from 'nodecloud-brakes';
import logger from '../utils/logger';
import config from '../config/configClient';

import ResponseError from '../errors/ResponseError';
import {InternalError} from 'yan-error-class';

const cache = {};
let isEnable = true;

const handler = {
    postHandle(err, response) {
        if (err && err.statusCode) {
            logger.warn(`Invoke the remote api ${_.get(err, 'response.request.href')} fail.`);
            return err.response || {};
        } else if (err && !err.statusCode) {
            throw err;
        }

        logger.info(`Invoke the remote api ${_.get(response, 'request.href')} success.`);
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

async function loadConfig(path) {
    const cfg = await config.getConfig(path);
    logger.info(`Loaded the ${path} configuration from ${cfg.type}`);
    return _.get(cfg, 'config', {});
}

function getLbClient(serviceName, options) {
    // new Loadbalance
    const client = loadbalance.getClient(serviceName, options);
    client.on('refreshing-services', (services, pool) => {
        logger.info(`Refreshing the ${serviceName}, the services: ${JSON.stringify(services.map(service => service.Service).map(service => `${service.Address}:${service.Port}`))}`)
    });

    return client;
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
            url: healthUrl || `/${serviceName}/health`,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    });

    return brake.circuit(client);
}

export async function getClient(serviceName, healthUrl) {
    if (isEnable && _.get(cache, `${serviceName}.brake`)) {
        return cache[serviceName].brake;
    }
    if (!isEnable && _.get(cache, `${serviceName}.lb`)) {
        return cache[serviceName].lb;
    }

    //get brake options
    const brakeOptions = await loadConfig('brake');
    if (brakeOptions.enable) {
        logger.info(`The ${serviceName}'s circuit is enabled.`);
        isEnable = true;
    } else {
        logger.info(`The ${serviceName}'s circuit is disabled`);
        isEnable = false;
    }

    // get loadbalance options
    const lbOptions = await loadConfig('loadbalance');
    // new Loadbalance
    const client = getLbClient(serviceName, lbOptions);
    if (!isEnable) {
        _.set(cache, `${serviceName}.lb`, client);
        return client;
    }

    // new Brake
    const brakes = getBrakeClient(serviceName, client, brakeOptions, healthUrl);
    _.set(cache, `${serviceName}.brake`, brakes);
    return brakes;
}