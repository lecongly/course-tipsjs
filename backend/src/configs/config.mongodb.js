const dev = {
  db: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || '27017',
    name: process.env.DEV_DB_NAME || 'shopDev'
  }
}

const prod = {
  db: {
    host: process.env.PRO_DB_HOST || 'localhost',
    port: process.env.PRO_DB_PORT || '27017',
    name: process.env.PRO_DB_NAME || 'shopPro'
  }
}

const config = { dev, prod }

const env = process.env.NODE_ENV || 'dev'

module.exports = config[env]