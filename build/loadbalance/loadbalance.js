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

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const serviceMap = {};

const handler = {
    preSend(request) {
        _logger2.default.info(`Will invoke the api ${JSON.stringify(request)}`);
    },
    postSend(err, response) {
        if (err && err.statusCode) {
            _logger2.default.warn(`Invoked the remote api ${_.get(err, 'response.request.href')} fail. response: ${JSON.stringify(_.get(err, 'response.body'))}`);
            return err.response || {};
        } else if (err && !err.statusCode) {
            _logger2.default.warn(`Invoked fail, internal error.`, err);
        } else {
            _logger2.default.info(`Invoked the remote api ${_.get(response, 'request.href')} success. response: ${JSON.stringify(_.get(response, 'body'))}`);
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
    const lbClient = new _loadbalanceClient2.default(service, _consul2.default.client, defaults);
    lbClient.onPreSend(handler.preSend);
    lbClient.onPostSend(handler.postSend);
    return lbClient;
}