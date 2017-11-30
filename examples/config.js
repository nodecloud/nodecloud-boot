module.exports = {
    dataSource: {
        database: 'test',
        host: '127.0.0.1',
        username: 'root',
        password: 'root',
        pool: {
            min: 10,
            max: 100,
            idle: 20000,
            acquire: 20000
        }
    },
    loadbalance: {
        strategy: 'random',
        request: {
            forever: true,
            timeout: 60000
        }
    },
    brake: {
        timeout: 60000
    }
};