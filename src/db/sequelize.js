import Sequelize from 'sequelize';
import _ from 'lodash';
import config from '../config/configClient';
import * as cfg from '../config/consulConfig';
import logger from '../utils/logger';

export default new class SequelizeClient {
    constructor() {
        this.sequelize = null;
        this.models = {};
    }

    async init(models) {
        let configuration = {};
        if (config) {
            const ds = await config.getConfig('dataSource');
            if (!ds || !ds.config) {
                throw new Error('Cannot load the configuration, please check config-service.');
            }

            configuration = ds.config;
        } else {
            configuration = await cfg.get('dataSource');
        }


        logger.info(`Loaded the database configuration.`);

        this.sequelize = new Sequelize(configuration['database'], configuration['username'], configuration['password'], {
            host: configuration['host'],
            port: configuration['port'],
            dialect: 'mysql',
            pool: {
                max: _.get(configuration, 'pool.max', 100),
                min: _.get(configuration, 'pool.min', 10),
                maxIdleTime: _.get(configuration, 'pool.idle', 60000),
                acquire: _.get(configuration, 'pool.acquire', 20000),
                handleDisconnects: true,
                testOnBorrow: true
            },
            dialectOptions: {
                connectTimeout: 10000
            },
            logging: (message) => {
                logger.debug('sequelize sql   >>>>>>>>>>>>  ' + message);
            }
        });

        try {
            await this.sequelize.authenticate();
            logger.info('Connection has been established successfully.');
        } catch (e) {
            throw new Error('Unable to connect to the database:', e);
        }

        if (models) {
            this.initModels(models);
        }
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
}