import Client, {ERROR_EVENT} from 'nodecloud-config-client';
import * as config from './config';
import * as loadbalanceClient from '../loadbalance/loadbalance';

import logger from '../utils/logger';

const client = loadbalanceClient.getClient(config.getConfig('config.server.name', 'multi-cloud-config-service'));

const localEnable = config.getConfig('config.local.enable', false);
const remoteEnable = config.getConfig('config.server.enable', false);

const options = {};
if (remoteEnable) {
    options.remote = {
        client: {
            send: async request => {
                const response = await client.send(request);
                return response.body;
            }
        },
        url: config.getConfig('config.server.url', '/multi-cloud-config-service/v1/config/:service/:env/inner'),
        service: config.getConfig('config.server.client'),
        interval: config.getConfig('config.server.interval', 60000)
    }
}
if (localEnable) {
    options.local = {
        path: config.getConfig('config.local.path', __dirname),
        service: config.getConfig('config.local.service', 'application'),
        ext: config.getConfig('config.local.ext', 'js')
    }
}

const configClient = new Client(options);

configClient.on(ERROR_EVENT, err => {
    logger.error(`Refresh config error.`, err);
});

export default configClient;