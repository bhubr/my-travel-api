const mysql = require('mysql');
const { promisify } = require('util');
const settings = require('./settings');

const connection = mysql.createConnection(settings.mysql);
const query = promisify(connection.query.bind(connection));

setInterval(() => connection.query('SELECT 1'), 30000);

module.exports = {
  query: async (...args) => query(...args)
};
