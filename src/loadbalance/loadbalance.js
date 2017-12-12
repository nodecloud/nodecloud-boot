import _ from 'lodash';
import LoadbalanceClient from 'loadbalance-client';
import consul from './consul';
import logger from '../utils/logger';

const serviceMap = {};

const handler = {
    preSend(request) {
        logger.info(`Will invoke the api ${JSON.stringify(request)}`);
    },
    postSend(err, response) {
        if (err && err.statusCode) {
            logger.warn(`Invoked the api ${_.get(err, 'response.request.href')} fail. response: ${JSON.stringify(_.get(err, 'response.body'))}`);
            return err.response || {};
        } else if (err && !err.statusCode) {
            logger.warn(`Invoked fail, internal error.`, err);
        } else {
            logger.info(`Invoked the api ${_.get(response, 'request.href')} success. response: ${JSON.stringify(_.get(response, 'body'))}`);
        }
    }
};

/**
 * Send the http request by loadbalance.
 *
 * @param service        {string} the service name.
 * @param request        {object}
 * @param request.url
 * @param request.method
 * @param request.qs
 * @param request.params
 * @param request.body
 */
export function send(service, request) {
    return getClient(service).send(request);
}

export function getClient(service, defaults) {
    if (!serviceMap[service]) {
        serviceMap[service] = initLoadbalancer(service, defaults);
    }

    return serviceMap[service];
}

function initLoadbalancer(service, defaults = {request: {forever: true}}) {
    const lbClient = new LoadbalanceClient(service, consul.client, defaults);
    lbClient.onPreSend(handler.preSend);
    lbClient.onPostSend(handler.postSend);
    lbClient.on('refreshing-services', (services, pool) => {
        logger.debug(`Refreshing the ${service}, the services: ${JSON.stringify(
            services.map(service => service.Service).map(service => `${service.Address}:${service.Port}`))}`)
    });
    return lbClient;
}