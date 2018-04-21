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
    logger: {
        path: __dirname
    },
    tracing: true,
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