const fs = require('fs').promises;
const path = require('path');
const db = require('../lib/db');
const { mysql } = require('../settings');

const doesMigrationTableExist = async () => {
  const sql = `SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = ?
  AND table_name = 'migration'`;
  const tables = await db.query(sql, [mysql.database]);
  return tables.length > 0;
};

const createMigrationsTable = async () => {
  const migrationSqlFile = path.join(__dirname, '20200311-01-add-migrations-table.sql');
  const sql = await fs.readFile(migrationSqlFile, 'utf8');
  await db.query(sql);
};

module.exports = {
  async up() {
    const migrationsTableExists = await doesMigrationTableExist();
    if (migrationsTableExists) {
      return;
    }
    await createMigrationsTable();
  },
};
