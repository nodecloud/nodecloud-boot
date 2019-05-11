import Client, {ERROR_EVENT} from 'nodecloud-config-client';
import * as bootstrap from './bootstrap';
import * as loadbalanceClient from '../loadbalance/loadbalance';

import logger from '../utils/logger';

const client = loadbalanceClient.getClient(bootstrap.getConfig('config.server.name', 'multi-cloud-config-service'));

const localEnable = bootstrap.getConfig('config.local.enable', false);
const remoteEnable = bootstrap.getConfig('config.server.enable', false);

const options = {};
if (remoteEnable) {
    options.remote = {
        client: {
            send: async request => {
                try {
                    const response = await client.send(request);
                    return response.body;
                } catch (e) {
                    return {};
                }
            }
        },
        url: bootstrap.getConfig('config.server.url', '/multi-cloud-config-service/v1/config/:service/:env/inner'),
        service: bootstrap.getConfig('config.server.client'),
        interval: bootstrap.getConfig('config.server.interval', 60000)
    }
}
if (localEnable) {
    options.local = {
        path: bootstrap.getConfig('config.local.path', __dirname),
        service: bootstrap.getConfig('config.local.service', 'application'),
        ext: bootstrap.getConfig('config.local.ext', 'js')
    }
}

let configClient = null;
if (remoteEnable || localEnable) {
    configClient = new Client(options);
    configClient.on(ERROR_EVENT, err => {
        logger.error(`Refresh config error.`, err);
    });
}

export default configClient;
