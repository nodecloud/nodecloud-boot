import Client, {ERROR_EVENT} from 'nodecloud-config-client';
import * as config from './config';
import * as loadbalanceClient from '../loadbalance/loadbalance';

import logger from '../utils/logger';

const client = loadbalanceClient.getClient(config.getConfig('config.server.name', 'multi-cloud-config-service'));
const configClient = new Client({
    remote: {
        client: {
            send: async request => {
                const response = await client.send(request);
                return response.body;
            }
        },
        url: config.getConfig('config.server.url', '/multi-cloud-config-service/v1/config/:service/:env/inner'),
        service: config.getConfig('config.server.client'),
        interval: config.getConfig('config.server.interval', 60000)
    },
    local: {
        path: config.getConfig('config.local.path', __dirname),
        service: config.getConfig('config.local.service', 'application'),
        ext: config.getConfig('config.local.ext', 'js')
    }
});

configClient.on(ERROR_EVENT, err => {
    logger.error(`Refresh config error.`, err);
});

export default configClient;