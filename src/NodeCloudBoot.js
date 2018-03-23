import http from 'http';
import consul from './loadbalance/consul';
import logger from './utils/logger';
import * as bootstrap from './config/bootstrap';
import * as brakes from './loadbalance/brakes';
import * as loadbalance from './loadbalance/loadbalance';
import config from './config/configClient';
import * as consulConfig from './config/consulConfig';
import sequelize from './db/sequelize';

module.exports = {
    bootstrap: bootstrap,
    config: config,
    consulConfig: consulConfig,
    brakes: brakes,
    client: brakes,
    loadbalance: loadbalance,
    consul: consul,
    sequelize: sequelize,
    logger: logger,
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
    sequelize.init(models);

    return initApp;
}

async function initNCBoot(models, options) {
    await sequelize.init(models);

    return initApp(options.initCallback, options.afterStop, options.beforeStop);
}

function initApp(initCallback, afterStop, beforeStop) {
    const server = http.createServer(initCallback(bootstrap.getConfig('web', {}))).listen(bootstrap.getConfig('web.port', 3000));
    consul.registerService(
        bootstrap.getConfig('web.serviceId'),
        bootstrap.getConfig('web.serviceName'),
        bootstrap.getConfig('web.port')
    );

    //Ctrl + C
    process.on('SIGINT', function () {
        logger.info("Stopping the service, please wait some times.");

        Promise.resolve().then(() => {
            if (typeof beforeStop === 'function' || (typeof beforeStop === 'object' && beforeStop.then)) {
                return beforeStop();
            }
        }).then(() => {
            sequelize.destroy();
            server.close(() => {
                try {
                    consul.deregisterService(err => {
                        if (typeof afterStop === 'function') {
                            afterStop();
                        }

                        logger.info("Stopped success");
                        err ? process.exit(1) : process.exit(0)
                    });
                } catch (e) {
                    if (typeof afterStop === 'function') {
                        afterStop();
                    }

                    process.exit(1)
                }
            });
        })
    });

    //kill -15
    process.on('SIGTERM', function () {
        logger.info("Stopping the service, please wait some times.");

        Promise.resolve().then(() => {
            if (typeof beforeStop === 'function' || (typeof beforeStop === 'object' && beforeStop.then)) {
                return beforeStop();
            }
        }).then(() => {
            sequelize.destroy();
            server.close(() => {
                try {
                    consul.deregisterService(err => {
                        if (typeof afterStop === 'function') {
                            afterStop();
                        }

                        logger.info("Stopped success");
                        err ? process.exit(1) : process.exit(0)
                    });
                } catch (e) {
                    if (typeof afterStop === 'function') {
                        afterStop();
                    }

                    process.exit(1);
                }
            });
        })
    });
}