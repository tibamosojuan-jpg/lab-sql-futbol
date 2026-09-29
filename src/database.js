const mysql = require('mysql2/promise');
const { database } = require('./config');

function createPool() {
  return mysql.createPool({
    ...database,
    waitForConnections: true,
    connectionLimit: 4,
    namedPlaceholders: false,
  });
}

module.exports = { createPool };
