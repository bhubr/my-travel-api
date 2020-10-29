const mysql = require('mysql');
const { promisify } = require('util');
const settings = require('./settings');

let mysqlSettings = settings.mysql;
if (
  process.env.NODE_ENV === 'production' &&
  typeof mysqlSettings === 'string'
) {
  console.log('using prod env');
  mysqlSettings += '&multipleStatements=true';
}

const pool = mysql.createConnection(mysqlSettings);
const query = promisify(pool.query.bind(pool));

module.exports = {
  query: async (...args) => query(...args),
};
