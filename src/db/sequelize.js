import Sequelize from 'sequelize';
import configClient from '../config/configClient';
import logger from '../utils/logger';

export default new class SequelizeClient {
    constructor() {
        this.sequelize = null;
        this.models = {};
    }

    async init(models) {
        const ds = await configClient.getConfig('dataSource');
        if (!ds || !ds.config) {
            throw new Error('Cannot load the configuration, please check config-service.');
        }

        logger.info(`Loaded the database configuration from ${ds.type}`);

        this.sequelize = new Sequelize(ds.config['database'], ds.config['username'], ds.config['password'], {
            host: ds.config['host'],
            port: ds.config['port'],
            dialect: 'mysql',
            pool: {
                max: ds.config['pool.max'],
                min: ds.config['pool.min'],
                maxIdleTime: ds.config['pool.idle']
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

        if (models.initialModels) {
            this.models = models.initialModels(this.sequelize);
        }
        if (models.initModels) {
            this.models = models.initModels(this.sequelize);
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