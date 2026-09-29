const STAT_FIELDS = [
  'goals', 'possession', 'shots', 'shots_on_target', 'passes', 'touches',
  'tackles', 'clearances', 'corners', 'offsides', 'fouls_conceded',
  'yellow_cards', 'red_cards',
];

async function resolveSeason(connection, cache, label, playedOn) {
  if (cache.has(label)) {
    const season = cache.get(label);
    season.startedOn = playedOn < season.startedOn ? playedOn : season.startedOn;
    season.endedOn = playedOn > season.endedOn ? playedOn : season.endedOn;

    return season.id;
  }

  const [result] = await connection.execute(
    'INSERT INTO season (label, started_on, ended_on) VALUES (?, ?, ?)',
    [label, playedOn, playedOn]
  );

  cache.set(label, { id: result.insertId, startedOn: playedOn, endedOn: playedOn });

  return result.insertId;
}

async function resolveTeam(connection, cache, name) {
  if (cache.has(name)) {
    return cache.get(name);
  }

  const [result] = await connection.execute(
    'INSERT INTO team (name) VALUES (?)',
    [name]
  );

  cache.set(name, result.insertId);

  return result.insertId;
}

async function insertGame(connection, seasonId, playedOn) {
  const [result] = await connection.execute(
    'INSERT INTO game (season_id, played_on) VALUES (?, ?)',
    [seasonId, playedOn]
  );

  return result.insertId;
}

async function insertStats(connection, gameId, stats, teamIds) {
  const columns = ['game_id', 'team_id', 'role', ...STAT_FIELDS];
  const placeholders = stats.map(() => `(${columns.map(() => '?').join(', ')})`);
  const values = stats.flatMap((stat, index) => [
    gameId,
    teamIds[index],
    stat.role,
    ...STAT_FIELDS.map((field) => stat[field]),
  ]);

  await connection.execute(
    `INSERT INTO game_team_stat (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`,
    values
  );
}

async function refreshSeasonRanges(connection, cache) {
  for (const [label, season] of cache) {
    await connection.execute(
      'UPDATE season SET started_on = ?, ended_on = ? WHERE label = ?',
      [season.startedOn, season.endedOn, label]
    );
  }
}

module.exports = { resolveSeason, resolveTeam, insertGame, insertStats, refreshSeasonRanges };
