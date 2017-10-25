import LoadbalanceClient from 'loadbalance-client';
import consul from './consul';

const serviceMap = {};

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

export function getClient(service) {
    if (!serviceMap[service]) {
        serviceMap[service] = initLoadbalancer(service);
    }

    return serviceMap[service];
}

function initLoadbalancer(service) {
    return new LoadbalanceClient(service, consul.client, {
        request: {
            forever: true
        }
    });
}