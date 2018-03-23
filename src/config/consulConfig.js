import ConsulConfig from 'nodecloud-consul-config';
import * as bootstrap from './bootstrap';
import consul from '../loadbalance/consul';

const config = new ConsulConfig(consul.client, bootstrap.getConfig('web.serviceName'), {format: 'yaml'});

export function get(path, defaults, options) {
    return config.get(path, defaults, options);
}

export function watch(path, defaults, callback, options) {
    return config.watch(path, defaults, callback, options);
}