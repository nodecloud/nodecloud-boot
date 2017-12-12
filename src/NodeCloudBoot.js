import http from 'http';
import consul from './loadbalance/consul';
import logger from './utils/logger';
import * as bootstrap from './config/bootstrap';
import * as brakes from './loadbalance/brakes';
import * as loadbalance from './loadbalance/loadbalance';
import config from './config/configClient';
import sequelize from './db/sequelize';

module.exports = {
    bootstrap: bootstrap,
    config: config,
    brakes: brakes,
    loadbalance: loadbalance,
    consul: consul,
    sequelize: sequelize,
    logger: logger,
    init: init,
    initApp: initApp
};

function init(models) {
    sequelize.init(models);

    return initApp;
}

function initApp(startCallback, endCallback) {
    const server = http.createServer(startCallback(bootstrap.getConfig('web', {}))).listen(bootstrap.getConfig('web.port', 3000));
    consul.registerService(
        bootstrap.getConfig('web.serviceId'),
        bootstrap.getConfig('web.serviceName'),
        bootstrap.getConfig('web.port')
    );

    //Ctrl + C
    process.on('SIGINT', function () {
        logger.info("Stopping the service, please wait some times.");

        if (typeof endCallback === 'function') {
            endCallback();
        }
        sequelize.destroy();
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

        if (typeof endCallback === 'function') {
            endCallback();
        }
        sequelize.destroy();
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