'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _configClient = require('../config/configClient');

var _configClient2 = _interopRequireDefault(_configClient);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = new class SequelizeClient {
    constructor() {
        this.sequelize = null;
        this.models = {};
    }

    init(models) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const ds = yield _configClient2.default.getConfig('dataSource');
            if (!ds || !ds.config) {
                throw new Error('Cannot load the configuration, please check config-service.');
            }

            _logger2.default.info(`Loaded the database configuration from ${ds.type}`);

            _this.sequelize = new _sequelize2.default(ds.config['database'], ds.config['username'], ds.config['password'], {
                host: ds.config['host'],
                port: ds.config['port'],
                dialect: 'mysql',
                pool: {
                    max: ds.config['pool.max'],
                    min: ds.config['pool.min'],
                    maxIdleTime: ds.config['pool.idle']
                },
                logging: function (message) {
                    _logger2.default.debug('sequelize sql   >>>>>>>>>>>>  ' + message);
                }
            });

            try {
                yield _this.sequelize.authenticate();
                _logger2.default.info('Connection has been established successfully.');
            } catch (e) {
                throw new Error('Unable to connect to the database:', e);
            }

            if (models) {
                _this.initModels(models);
            }
        })();
    }

    /**
     *
     * @param models               {function|object}
     * @param models.initModels    {function}
     * @param models.initialModels {function}
     */
    initModels(models) {
        if (typeof models === 'function') {
            this.models = models(this.sequelize);
        } else if (typeof models.initModels === 'function') {
            this.models = models.initModels(this.sequelize);
        } else if (typeof models.initialModels === 'function') {
            this.models = models.initialModels(this.sequelize);
        }
    }

    destroy() {
        if (this.sequelize) {
            this.sequelize.close();
        }
    }

    transaction(func) {
        if (!this.sequelize) {
            throw new Error(`No sequelize instance, please wait a time.`);
        }

        return this.sequelize.transaction(func);
    }

    query(...params) {
        if (!this.sequelize) {
            throw new Error(`No sequelize instance, please wait a time.`);
        }

        return this.sequelize.query(...params);
    }

    model(...models) {
        if (!this.sequelize) {
            throw new Error(`No sequelize instance, please wait a time.`);
        }

        const result = {};

        models.forEach(model => result[model] = this.models[model]);

        return result;
    }
}();