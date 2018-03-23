import ConsulConfig from 'nodecloud-consul-config';
import consul from '../loadbalance/consul';

const config = new ConsulConfig(consul.client, {format: 'yaml'});

export function get(path, defaults, options) {
    return config.get(path, defaults, options);
}

export function watch(path, defaults, callback, options) {
    return config.watch(path, defaults, callback, options);
}