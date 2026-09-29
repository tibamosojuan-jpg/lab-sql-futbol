const { createPool } = require('./database');

const COUNT_QUERIES = [
  { label: 'Temporadas', sql: 'SELECT COUNT(*) AS total FROM season' },
  { label: 'Equipos', sql: 'SELECT COUNT(*) AS total FROM team' },
  { label: 'Partidos', sql: 'SELECT COUNT(*) AS total FROM game' },
  { label: 'Participaciones', sql: 'SELECT COUNT(*) AS total FROM game_team_stat' },
];

const INTEGRITY_QUERIES = [
  {
    label: 'Partidos sin exactamente dos participantes',
    sql: `SELECT COUNT(*) AS total FROM (
            SELECT game_id FROM game_team_stat
            GROUP BY game_id HAVING COUNT(*) <> 2
          ) AS broken`,
  },
  {
    label: 'Partidos cuya posesion no suma 100',
    sql: `SELECT COUNT(*) AS total FROM (
            SELECT game_id FROM game_team_stat
            GROUP BY game_id HAVING ABS(SUM(possession) - 100) > 0.05
          ) AS broken`,
  },
];

async function report(connection, queries, heading) {
  console.log(`\n${heading}`);

  for (const { label, sql } of queries) {
    const [[row]] = await connection.query(sql);
    console.log(`  ${label}: ${row.total}`);
  }
}

async function run() {
  const pool = createPool();
  const connection = await pool.getConnection();

  try {
    await report(connection, COUNT_QUERIES, 'Conteo de registros por tabla');
    await report(connection, INTEGRITY_QUERIES, 'Verificaciones de integridad (deben dar 0)');
  } finally {
    connection.release();
    await pool.end();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error(`La verificacion fallo: ${error.message}`);
    process.exitCode = 1;
  });
}
