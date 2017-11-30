'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.send = send;
exports.getClient = getClient;

var _loadbalanceClient = require('loadbalance-client');

var _loadbalanceClient2 = _interopRequireDefault(_loadbalanceClient);

var _consul = require('./consul');

var _consul2 = _interopRequireDefault(_consul);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function send(service, request) {
    return getClient(service).send(request);
}

function getClient(service, defaults) {
    if (!serviceMap[service]) {
        serviceMap[service] = initLoadbalancer(service, defaults);
    }

    return serviceMap[service];
}

function initLoadbalancer(service, defaults = { request: { forever: true } }) {
    return new _loadbalanceClient2.default(service, _consul2.default.client, defaults);
}