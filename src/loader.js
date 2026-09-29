const { DATASET_PATH } = require('./config');
const { createPool } = require('./database');
const { readDataset } = require('./datasetReader');
const { mapRow } = require('./rowMapper');
const {
  resolveSeason, resolveTeam, insertGame, insertStats, refreshSeasonRanges,
} = require('./repository');

const FAILURES_SHOWN = 10;

function describeFailure(lineNumber, error) {
  const code = error.code ? ` [${error.code}]` : '';

  return `  linea ${lineNumber}${code}: ${error.message}`;
}

async function persistGame(connection, caches, record) {
  const seasonId = await resolveSeason(
    connection, caches.seasons, record.seasonLabel, record.playedOn
  );
  const teamIds = [];

  for (const stat of record.stats) {
    teamIds.push(await resolveTeam(connection, caches.teams, stat.teamName));
  }

  const gameId = await insertGame(connection, seasonId, record.playedOn);
  await insertStats(connection, gameId, record.stats, teamIds);
}

async function load() {
  const rows = await readDataset(DATASET_PATH);
  const pool = createPool();
  const connection = await pool.getConnection();
  const caches = { seasons: new Map(), teams: new Map() };
  const failures = [];
  let inserted = 0;

  try {
    for (const [index, row] of rows.entries()) {
      const lineNumber = index + 2;

      try {
        await persistGame(connection, caches, mapRow(row));
        inserted += 1;
      } catch (error) {
        failures.push({ lineNumber, error });
      }
    }

    await refreshSeasonRanges(connection, caches.seasons);
  } finally {
    connection.release();
    await pool.end();
  }

  return { total: rows.length, inserted, failures };
}

async function run() {
  const { total, inserted, failures } = await load();

  console.log(`Filas leidas del dataset: ${total}`);
  console.log(`Partidos insertados: ${inserted}`);
  console.log(`Filas rechazadas: ${failures.length}`);

  if (failures.length > 0) {
    console.log('\nDetalle de los rechazos:');
    failures
      .slice(0, FAILURES_SHOWN)
      .forEach(({ lineNumber, error }) => console.log(describeFailure(lineNumber, error)));

    if (failures.length > FAILURES_SHOWN) {
      console.log(`  ... y ${failures.length - FAILURES_SHOWN} rechazos mas`);
    }

    process.exitCode = 1;
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error(`La carga no pudo completarse: ${error.message}`);
    process.exitCode = 1;
  });
}