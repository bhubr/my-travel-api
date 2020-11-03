const fs = require('fs').promises;
const path = require('path');
const db = require('../lib/db');

module.exports = {
  async up() {
    const migrationSqlFile = path.join(__dirname, '20200311-02-add-github-id.sql');
    const sql = await fs.readFile(migrationSqlFile, 'utf8');
    await db.query(sql);
  },
};
