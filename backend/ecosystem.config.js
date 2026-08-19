module.exports = {
    apps: [
        {
            name: 'weshoot-backend',
            script: 'src/server.js',
            cwd: '/var/www/html/weshoot/backend',
            instances: 'max',
            exec_mode: 'cluster',
            env_production: {
                NODE_ENV: 'production',
                PORT: 5001,
                DB_HOST: 'localhost',
                DB_PORT: 5432,
                DB_NAME: 'weshoot',
                DB_USER: 'akram',
                DB_PASSWORD: process.env.DB_PASSWORD
            },
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'logs/error.log',
            out_file: 'logs/out.log',
            merge_logs: true,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G'
        }
    ]
};
