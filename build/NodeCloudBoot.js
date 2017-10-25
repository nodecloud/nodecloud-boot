'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.init = undefined;

let init = exports.init = (() => {
    var _ref = _asyncToGenerator(function* (models, startCallback, stopCallback) {
        yield _sequelize2.default.init(models);

        const server = _http2.default.createServer(startCallback(config.getConfig('web', {}))).listen(config.getConfig('web.port', 3000));
        _consul2.default.registerService(config.getConfig('web.serviceId'), config.getConfig('web.serviceName'), config.getConfig('web.port'));

        //Ctrl + C
        process.on('SIGINT', function () {
            _logger2.default.info("Stopping the service, please wait some times.");
            if (typeof stopCallback === 'function') {
                stopCallback();
            }
            server.close(() => {
                try {
                    _consul2.default.deregisterService(err => {
                        _logger2.default.info("Stopped success");
                        err ? process.exit(1) : process.exit(0);
                    });
                } catch (e) {
                    process.exit(1);
                }
            });
        });

        //kill -15
        process.on('SIGTERM', function () {
            _logger2.default.info("Stopping the service, please wait some times.");
            if (typeof stopCallback === 'function') {
                stopCallback();
            }
            server.close(() => {
                try {
                    _consul2.default.deregisterService(err => {
                        _logger2.default.info("Stopped success");
                        err ? process.exit(1) : process.exit(0);
                    });
                } catch (e) {
                    process.exit(1);
                }
            });
        });
    });

    return function init(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

exports.getClient = getClient;
exports.getConfigClient = getConfigClient;
exports.getConsul = getConsul;
exports.getSequelize = getSequelize;
exports.getLoadbalance = getLoadbalance;
exports.getLogger = getLogger;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _consul = require('./loadbalance/consul');

var _consul2 = _interopRequireDefault(_consul);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('./config/config');

var config = _interopRequireWildcard(_config);

var _brakes = require('./loadbalance/brakes');

var brakes = _interopRequireWildcard(_brakes);

var _loadbalance = require('./loadbalance/loadbalance');

var loadbalance = _interopRequireWildcard(_loadbalance);

var _configClient = require('./config/configClient');

var _configClient2 = _interopRequireDefault(_configClient);

var _sequelize = require('./db/sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function getClient() {
    return brakes;
}

function getConfigClient() {
    return _configClient2.default;
}

function getConsul() {
    return _consul2.default;
}

function getSequelize() {
    return _sequelize2.default;
}

function getLoadbalance() {
    return loadbalance;
}

function getLogger() {
    return _logger2.default;
}