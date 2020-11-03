/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const Promise = require('bluebird');
const debug = require('debug');
const db = require('../src/lib/db');

const logInfo = debug('dbmigrate:info');
const logErr = debug('dbmigrate:error');

const migrationsDir = path.resolve(__dirname, '../src/migrations');

const getMigrationByName = async migrationName =>
  db
    .query('SELECT * FROM migration WHERE name = ?', [migrationName])
    .then(records => records[0])
    .catch(logErr);

const runMigration = async (count, migrationName) => {
  const migrationRecord = await getMigrationByName(migrationName);
  if (migrationRecord) {
    logInfo('migration already applied', count, migrationName);
    return count + 1;
  }
  const migrationFilePath = path.join(migrationsDir, migrationName);
  logInfo('applying migration', count, migrationName);
  const { up } = require(migrationFilePath);
  try {
    await up();
    const sqlMigration = 'INSERT INTO migration SET ?';
    await db.query(sqlMigration, {
      name: migrationName,
      status: 'success',
    });
  } catch (err) {
    logErr(err.message);
  }
  return count + 1;
};

const getMigrationFiles = async () => {
  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter(file => file.match(/\.js$/))
    .map(file => file.replace(/\.js/, ''));
  try {
    await Promise.reduce(migrationFiles, runMigration, 0);
    process.exit(0);
  } catch (err) {
    logErr(err.message);
    process.exit(1);
  }
};

getMigrationFiles();
