import ConsulConfig from 'nodecloud-consul-config';
import _ from 'lodash';
import * as bootstrap from './bootstrap';
import consul from '../loadbalance/consul';

const config = new ConsulConfig(consul.client, bootstrap.getConfig('web.serviceName'), process.env.NODE_ENV, {
    format: 'yaml',
    token: bootstrap.getConfig('consul.token')
});

let configs = {};

config.watch(null, null, (err, data) => {
    configs = data;
}, {timeout: 300000});
config.get().then(data => configs = data);

export async function get(path, defaults, options) {
    if (configs[path]) {
        return _.get(configs, path, defaults);
    } else {
        try {
            return await config.get(path, defaults, options);
        } catch (e) {
            return _.get(configs, path, defaults);
        }
    }
}

export function watch(path, defaults, callback, options) {
    return config.watch(path, defaults, callback, options);
}
