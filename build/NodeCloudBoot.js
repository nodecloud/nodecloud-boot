'use strict';

let initNCBoot = (() => {
    var _ref = _asyncToGenerator(function* (models, options) {
        yield _sequelize2.default.init(models);

        return initApp(options.initCallback, options.afterStop, options.beforeStop);
    });

    return function initNCBoot(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _consul = require('./loadbalance/consul');

var _consul2 = _interopRequireDefault(_consul);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _bootstrap = require('./config/bootstrap');

var bootstrap = _interopRequireWildcard(_bootstrap);

var _brakes = require('./loadbalance/brakes');

var brakes = _interopRequireWildcard(_brakes);

var _loadbalance = require('./loadbalance/loadbalance');

var loadbalance = _interopRequireWildcard(_loadbalance);

var _configClient = require('./config/configClient');

var _configClient2 = _interopRequireDefault(_configClient);

var _consulConfig = require('./config/consulConfig');

var consulConfig = _interopRequireWildcard(_consulConfig);

var _sequelize = require('./db/sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = {
    bootstrap: bootstrap,
    config: _configClient2.default,
    consulConfig: consulConfig,
    brakes: brakes,
    client: brakes,
    loadbalance: loadbalance,
    consul: _consul2.default,
    sequelize: _sequelize2.default,
    logger: _logger2.default,
    init: init,
    initApp: initApp,
    initNCBoot: initNCBoot
};

/**
 * @deprecated
 * @param models
 * @return {initApp}
 */
function init(models) {
    _sequelize2.default.init(models);

    return initApp;
}

function initApp(initCallback, afterStop, beforeStop) {
    const server = _http2.default.createServer(initCallback(bootstrap.getConfig('web', {}))).listen(bootstrap.getConfig('web.port', 3000));
    _consul2.default.registerService(bootstrap.getConfig('web.serviceId'), bootstrap.getConfig('web.serviceName'), bootstrap.getConfig('web.port'));

    //Ctrl + C
    process.on('SIGINT', function () {
        _logger2.default.info("Stopping the service, please wait some times.");

        Promise.resolve().then(() => {
            if (typeof beforeStop === 'function' || typeof beforeStop === 'object' && beforeStop.then) {
                return beforeStop();
            }
        }).then(() => {
            _sequelize2.default.destroy();
            server.close(() => {
                try {
                    _consul2.default.deregisterService(err => {
                        if (typeof afterStop === 'function') {
                            afterStop();
                        }

                        _logger2.default.info("Stopped success");
                        err ? process.exit(1) : process.exit(0);
                    });
                } catch (e) {
                    if (typeof afterStop === 'function') {
                        afterStop();
                    }

                    process.exit(1);
                }
            });
        });
    });

    //kill -15
    process.on('SIGTERM', function () {
        _logger2.default.info("Stopping the service, please wait some times.");

        Promise.resolve().then(() => {
            if (typeof beforeStop === 'function' || typeof beforeStop === 'object' && beforeStop.then) {
                return beforeStop();
            }
        }).then(() => {
            _sequelize2.default.destroy();
            server.close(() => {
                try {
                    _consul2.default.deregisterService(err => {
                        if (typeof afterStop === 'function') {
                            afterStop();
                        }

                        _logger2.default.info("Stopped success");
                        err ? process.exit(1) : process.exit(0);
                    });
                } catch (e) {
                    if (typeof afterStop === 'function') {
                        afterStop();
                    }

                    process.exit(1);
                }
            });
        });
    });
}