import path from 'path';

module.exports = {
    web: {
        serviceId: '',
        serviceName: '',
        port: ''
    },
    consul: {
        host: '',
        port: '',
        discoveryHost: '',
        timeout: '1s',
        interval: '10s',
        token: ''
    },
    config: {
        server: {
            name: 'multi-cloud-config-service',
            url: '/multi-cloud-config-service/v1/config/:service/:env/inner',
            interval: 60000,
            watch: false,
            client: 'multi-cloud-service'
        },
        local: {
            path: path.resolve(__dirname, './log'),
            service: 'application',
            ext: 'yml'
        }
    },
    logger: {
        path: __dirname
    },
    loadbalance: {
        strategy: 'random',
        request: {
            forever: true,
            timeout: 60000
        }
    },
    brake: {
        enable: true,
        timeout: 60000
    }
};