const mysql = require('mysql');
const { promisify } = require('util');
const settings = require('./settings');

const pool = mysql.createConnection(settings.mysql);
const query = promisify(pool.query.bind(pool));

module.exports = {
  query: async (...args) => query(...args),
};
