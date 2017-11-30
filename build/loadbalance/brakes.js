'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getClient = getClient;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _loadbalance = require('../loadbalance/loadbalance');

var loadbalance = _interopRequireWildcard(_loadbalance);

var _nodecloudBrakes = require('nodecloud-brakes');

var _nodecloudBrakes2 = _interopRequireDefault(_nodecloudBrakes);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _bootstrap = require('../config/bootstrap');

var bootstrap = _interopRequireWildcard(_bootstrap);

var _ResponseError = require('../errors/ResponseError');

var _ResponseError2 = _interopRequireDefault(_ResponseError);

var _yanErrorClass = require('yan-error-class');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cache = {};

//get brake options
const brakeOptions = bootstrap.getConfig('brakes', { enable: true, timeout: 60000 });
if (brakeOptions.enable) {
    _logger2.default.info('The circuit is enable.');
} else {
    _logger2.default.info('The circuit is disable.');
}

//get loadbalance options
const lbOptions = bootstrap.getConfig('loadbalance', { request: { forever: true } });

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
            const body = response.body || {};

            //If body.message is exist, throw body.message or throw body.
            throw new _ResponseError2.default(response.statusCode, { code: body.code, message: body.message || body });
        }
    }
};

function getLbClient(serviceName, options) {
    // new Loadbalance
    const client = loadbalance.getClient(serviceName, options);
    client.on('refreshing-services', (services, pool) => {
        _logger2.default.info(`Refreshing the ${serviceName}, the services: ${JSON.stringify(services.map(service => service.Service).map(service => `${service.Address}:${service.Port}`))}`);
    });

    return client;
}

function getBrakeClient(serviceName, client, options, healthUrl) {
    const brake = new _nodecloudBrakes2.default(serviceName, _extends({ handler: handler }, options));
    brake.fallback(err => {
        _logger2.default.error(`Cannot invoke downstream service ${serviceName}. please try again soon.`, err);
        throw new _yanErrorClass.InternalError(`Cannot invoke downstream service ${serviceName}. please try again soon.`);
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

    return brake.circuit(client);
}

function getClient(serviceName, healthUrl) {
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