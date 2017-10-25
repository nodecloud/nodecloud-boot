import http from 'http';
import consul from './loadbalance/consul';
import logger from './utils/logger';
import * as config from './config/config';

import * as brakes from './loadbalance/brakes';
import configClient from './config/configClient';
import sequelize from './db/sequelize';

export function getClient(serviceName, healthUrl) {
    return brakes.getClient(serviceName, healthUrl);
}

export function getConfig(path, defaultValue) {
    return configClient.getConfig(path, defaultValue);
}

export function getConsul() {
    return consul;
}

export function getSequelize() {
    return sequelize;
}

export async function start(models, startCallback, stopCallback) {
    await sequelize.init(models);

    const server = http.createServer(startCallback).listen(config.getConfig('web.port', 3000));
    consul.registerService(
        config.getConfig('web.serviceId'),
        config.getConfig('web.serviceName'),
        config.getConfig('web.port')
    );

    //Ctrl + C
    process.on('SIGINT', function () {
        logger.info("Stopping the service, please wait some times.");
        if (typeof stopCallback === 'function') {
            stopCallback();
        }
        server.close(() => {
            try {
                consul.deregisterService(err => {
                    logger.info("Stopped success");
                    err ? process.exit(1) : process.exit(0)
                });
            } catch (e) {
                process.exit(1)
            }
        });
    });

    //kill -15
    process.on('SIGTERM', function () {
        logger.info("Stopping the service, please wait some times.");
        if (typeof stopCallback === 'function') {
            stopCallback();
        }
        server.close(() => {
            try {
                consul.deregisterService(err => {
                    logger.info("Stopped success");
                    err ? process.exit(1) : process.exit(0)
                });
            } catch (e) {
                process.exit(1)
            }
        });
    });
}