'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getClient = getClient;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _loadbalance = require('../loadbalance/loadbalance');

var loadbalance = _interopRequireWildcard(_loadbalance);

var _nodecloudBrakes = require('nodecloud-brakes');

var _nodecloudBrakes2 = _interopRequireDefault(_nodecloudBrakes);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _Error = require('../errors/Error');

var _Error2 = _interopRequireDefault(_Error);

var _ExternalError = require('../errors/ExternalError');

var _ExternalError2 = _interopRequireDefault(_ExternalError);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cache = {};

const handler = {
    postHandle(err, response) {
        if (err && err.statusCode) {
            _logger2.default.warn(`Invoke the remote api ${_lodash2.default.get(err, 'response.request.href')} fail.`);
            return err.response || {};
        } else if (err && !err.statusCode) {
            throw err;
        }

        _logger2.default.info(`Invoke the remote api ${_lodash2.default.get(response, 'request.href')} success.`);
        return response;
    },
    postCircuit(response) {
        if (response.statusCode < 300) {
            return response;
        } else {
            let body = response.body || {};

            //If body.message is exist, throw body.message or throw body.
            throw new _Error2.default(body.code, body.message || body, null, response.statusCode);
        }
    }
};

function getClient(serviceName, healthUrl) {
    const client = loadbalance.getClient(serviceName);
    const brake = new _nodecloudBrakes2.default(serviceName, { handler: handler });

    client.on('refreshing-services', (services, pool) => {
        _logger2.default.info(`Refreshing the ${serviceName}, the services: ${JSON.stringify(services.map(service => service.Service).map(service => `${service.Address}:${service.Port}`))}`);
    });

    brake.fallback(err => {
        throw new _ExternalError2.default('', `Cannot invoke downstream service ${serviceName}. please try again soon.`, err);
    });

    brake.on('circuitOpen', () => {
        _logger2.default.warn(`The service: ${serviceName}'s circuit is opened.`);
    });

    brake.on('circuitClosed', () => {
        _logger2.default.info(`The service: ${serviceName}'s circuit is closed.`);
    });

    brake.healthCheck(() => {
        return client.send({
            method: 'get',
            url: healthUrl || `/${serviceName}/health`,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    });

    if (cache[serviceName]) {
        return cache[serviceName];
    }

    return cache[serviceName] = brake.circuit(client);
}