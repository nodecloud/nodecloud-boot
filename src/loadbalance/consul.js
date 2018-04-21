import Consul from 'consul';
import md5encode from 'blueimp-md5';
import * as bootstrap from '../config/bootstrap';
import logger from '../utils/logger';
import * as interfaces from '../utils/interfaces';
import sleep from '../utils/sleep';
import ConsulConfig from "nodecloud-consul-config";

export default new class ConsulClient {
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

        this.client = new Consul({host: this.consulHost, port: this.consulPort});

        this.config = new ConsulConfig(this.client, bootstrap.getConfig('web.serviceName'), process.env.NODE_ENV, {
            format: 'yaml',
            token: bootstrap.getConfig('consul.token')
        });
    }

    getService() {
        return {
            id: this.serviceId || md5encode(`${this.discoveryHost}:${this.servicePort}`),
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
    async getHealthServices(name, options = {}) {
        return new Promise((resolve, reject) => {
            this.client.health.service({
                ...options,
                service: name,
                passing: true,
                token: this.token,
            }, function (err, result) {
                if (err) return reject(err);

                resolve(result);
            });
        });
    }

    async registerService() {
        const maxRetry = bootstrap.getConfig('consul.retry.max', -1);
        const retryInterval = bootstrap.getConfig('consul.retry.interval', 5000);
        const service = this.getService();

        let current = 0;
        while (true) {
            try {
                await new Promise((resolve, reject) => {
                    this.client.agent.service.register(service, function (err) {
                        if (err) {
                            logger.error('Register the service error.', err);
                            return reject(err);
                        }

                        logger.info(`Register the service success. service id is ${service.id}.`);
                        resolve();
                    });
                });
                break;
            } catch (e) {
                if (maxRetry !== -1 && ++current > maxRetry) {
                    break;
                }
                await sleep(retryInterval);
            }
        }

        return service;
    }

    deregisterService(callback) {
        const service = this.getService();
        this.client.agent.service.deregister(service, function (err) {
            if (err) {
                logger.error('Deregister the service error.', err);
                callback && callback(err);
            }

            logger.info(`Deregister the service success. service id is ${service.id}`);
            callback && callback();
        });
    }

    watch(method, options = {}) {
        return this.client.watch({method: method, options: {...options, token: this.token}});
    }

    get(path, defaults, options) {
        return this.config.get(path, defaults, options);
    }

    watchConfig(path, defaults, callback, options) {
        return this.config.watch(path, defaults, callback, options);
    }
}