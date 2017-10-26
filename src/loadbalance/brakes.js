import _ from 'lodash';
import * as loadbalance from '../loadbalance/loadbalance';
import BrakeClient from 'nodecloud-brakes';

import logger from '../utils/logger';

import Error from '../errors/Error';
import ExternalError from '../errors/ExternalError';

const cache = {};

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
            let body = response.body || {};

            //If body.message is exist, throw body.message or throw body.
            throw new Error(body.code, body.message || body, null, response.statusCode);
        }
    }
};

export function getClient(serviceName, healthUrl) {
    const client = loadbalance.getClient(serviceName);
    const brake = new BrakeClient(serviceName, {handler: handler});

    client.on('refreshing-services', (services, pool) => {
        logger.info(`Refreshing the ${serviceName}, the services: ${JSON.stringify(services.map(service => service.Service).map(service => `${service.Address}:${service.Port}`))}`)
    });

    brake.fallback(err => {
        throw new ExternalError('', `Cannot invoke downstream service ${serviceName}. please try again soon.`, err);
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

    if (cache[serviceName]) {
        return cache[serviceName];
    }

    return cache[serviceName] = brake.circuit(client);
}