import http from 'http';
import consul from './loadbalance/consul';
import logger from './utils/logger';
import * as config from './config/config';

import * as brakes from './loadbalance/brakes';
import * as loadbalance from './loadbalance/loadbalance';
import configClient from './config/configClient';
import sequelize from './db/sequelize';

export function getClient() {
    return brakes;
}

export function getConfigClient() {
    return configClient;
}

export function getConsul() {
    return consul;
}

export function getSequelize() {
    return sequelize;
}

export function getLoadbalance() {
    return loadbalance;
}

export function getLogger() {
    return logger;
}

export async function init(models, startCallback, stopCallback) {
    await sequelize.init(models);

    const server = http.createServer(startCallback(config.getConfig('web', {}))).listen(config.getConfig('web.port', 3000));
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