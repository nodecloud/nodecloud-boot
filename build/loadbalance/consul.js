'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _consul = require('consul');

var _consul2 = _interopRequireDefault(_consul);

var _blueimpMd = require('blueimp-md5');

var _blueimpMd2 = _interopRequireDefault(_blueimpMd);

var _bootstrap = require('../config/bootstrap');

var bootstrap = _interopRequireWildcard(_bootstrap);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _interfaces = require('../utils/interfaces');

var interfaces = _interopRequireWildcard(_interfaces);

var _sleep = require('../utils/sleep');

var _sleep2 = _interopRequireDefault(_sleep);

var _consulConfig = require('../config/consulConfig');

var consulConfig = _interopRequireWildcard(_consulConfig);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = new class ConsulClient {
    constructor() {
        this.consulHost = bootstrap.getConfig('consul.host', 'localhost');
        this.consulPort = bootstrap.getConfig('consul.port', 8500);
        this.discoveryHost = bootstrap.getConfig('consul.discoveryHost', interfaces.getIPAddress());
        this.token = bootstrap.getConfig('consul.token');

        this.serviceId = bootstrap.getConfig('web.serviceId');
        this.serviceName = bootstrap.getConfig('web.serviceName');
        this.servicePort = bootstrap.getConfig('web.port');

        this.timeout = bootstrap.getConfig('consul.timeout', '1s');
        this.interval = bootstrap.getConfig('consul.interval', '10s');

        this.client = new _consul2.default({ host: this.consulHost, port: this.consulPort });
    }

    getService() {
        return {
            id: this.serviceId || (0, _blueimpMd2.default)(`${this.discoveryHost}:${this.servicePort}`),
            name: this.serviceName,
            address: this.discoveryHost,
            port: this.servicePort,
            check: {
                id: "api",
                name: `HTTP API on port ${this.servicePort}`,
                http: `http://${this.discoveryHost}:${this.servicePort}/health`,
                interval: this.interval,
                timeout: this.timeout
            },
            token: this.token
        };
    }

    /**
     * Get health service list.
     *
     * @param name
     * @param options
     * @return {Promise}
     */
    getHealthServices(name, options = {}) {
        var _this = this;

        return _asyncToGenerator(function* () {
            return new Promise(function (resolve, reject) {
                _this.client.health.service(_extends({}, options, {
                    service: name,
                    passing: true,
                    token: _this.token
                }), function (err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        })();
    }

    registerService() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const maxRetry = bootstrap.getConfig('consul.retry.max', -1);
            const retryInterval = bootstrap.getConfig('consul.retry.interval', 5000);
            const service = _this2.getService();

            let current = 0;
            while (true) {
                try {
                    yield new Promise(function (resolve, reject) {
                        _this2.client.agent.service.register(service, function (err) {
                            if (err) {
                                _logger2.default.error('Register the service error.', err);
                                return reject(err);
                            }

                            _logger2.default.info(`Register the service success. service id is ${service.id}.`);
                            resolve();
                        });
                    });
                    break;
                } catch (e) {
                    if (maxRetry !== -1 && ++current > maxRetry) {
                        break;
                    }
                    yield (0, _sleep2.default)(retryInterval);
                }
            }

            return service;
        })();
    }

    deregisterService(callback) {
        const service = this.getService();
        this.client.agent.service.deregister(service, function (err) {
            if (err) {
                _logger2.default.error('Deregister the service error.', err);
                callback && callback(err);
            }

            _logger2.default.info(`Deregister the service success. service id is ${service.id}`);
            callback && callback();
        });
    }

    watch(method, options = {}) {
        return this.client.watch({ method: method, options: _extends({}, options, { token: this.token }) });
    }

    getConfig(...params) {
        return consulConfig.get(...params);
    }

    watchConfig(...params) {
        return consulConfig.watch(...params);
    }
}();