import Consul from 'consul';
import md5encode from 'blueimp-md5';
import * as config from '../config/config';
import logger from '../utils/logger';
import * as interfaces from '../utils/interfaces';

export default new class ConsulClient {
    constructor() {
        this.consulHost = config.getConfig('consul.host', 'localhost');
        this.consulPort = config.getConfig('consul.port', 8500);
        this.discoveryHost = config.getConfig('consul.discoveryHost', interfaces.getIPAddress());

        this.serviceId = config.getConfig('web.serviceId');
        this.serviceName = config.getConfig('web.serviceName');
        this.servicePort = config.getConfig('web.port');

        this.timeout = config.getConfig('consul.timeout', '1s');
        this.interval = config.getConfig('consul.interval', '10s');

        this.client = new Consul({host: this.consulHost, port: this.consulPort});
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
            }
        };
    }

    /**
     * Get health service list.
     *
     * @param name
     * @return {Promise}
     */
    async getHealthServices(name) {
        return new Promise((resolve, reject) => {
            this.client.health.service({
                service: name,
                passing: true
            }, function (err, result) {
                if (err) return reject(err);

                resolve(result);
            });
        });
    }

    registerService() {
        const service = this.getService();
        this.client.agent.service.register(service, function (err) {
            if (err) {
                return logger.error('Register the service error.', err);
            }

            logger.info(`Register the service success. service id is ${service.id}.`);
        });

        return service;
    }

    deregisterService(callback) {
        const service = this.getService();
        this.client.agent.service.deregister(service.id, function (err) {
            if (err) {
                logger.error('Deregister the service error.', err);
                callback && callback(err);
            }

            logger.info(`Deregister the service success. service id is ${service.id}`);
            callback && callback();
        });
    }

    watch(method, options) {
        return this.client.watch({method: method, options: options});
    }
}