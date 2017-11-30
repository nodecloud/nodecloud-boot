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

export function getClient(service, defaults) {
    if (!serviceMap[service]) {
        serviceMap[service] = initLoadbalancer(service, defaults);
    }

    return serviceMap[service];
}

function initLoadbalancer(service, defaults = {request: {forever: true}}) {
    return new LoadbalanceClient(service, consul.client, defaults);
}