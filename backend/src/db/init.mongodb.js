const mongoose = require('mongoose');
const { db: { host, port, name } } = require('../configs/config.mongodb');

const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
  constructor() {
    this._connect();
  }

  _connect(type = 'mongodb') {

    if (true) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true })
    }

    mongoose.connect(connectString)
      .then(_ => {
        console.log('Database connection successful');
      })
      .catch(err => {
        console.error('Database connection error');
      });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;