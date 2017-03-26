const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json');

const envConfig = config[env];

const localConfig = config['generic']

export { envConfig as config, localConfig }