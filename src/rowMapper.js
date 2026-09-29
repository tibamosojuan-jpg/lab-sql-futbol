const { SIDE_COLUMNS } = require('./config');

const ROLES = [
  { role: 'home', side: 'home', teamColumn: 'home_team' },
  { role: 'away', side: 'away', teamColumn: 'away_team' },
];

function requireText(row, column) {
  const value = row[column];

  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Columna "${column}" vacia o ausente`);
  }

  return value;
}

function requireNumber(row, column) {
  const value = Number(row[column]);

  if (!Number.isFinite(value)) {
    throw new Error(`Columna "${column}" no es numerica: "${row[column]}"`);
  }

  return value;
}

function requireDate(row, column) {
  const value = requireText(row, column);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Columna "${column}" no tiene formato ISO: "${value}"`);
  }

  return value;
}

function buildStat(row, { role, side, teamColumn }) {
  const stat = { role, teamName: requireText(row, teamColumn) };

  for (const [field, template] of Object.entries(SIDE_COLUMNS)) {
    const column = template.replace('{side}', side).replace('{role}', role);
    stat[field] = requireNumber(row, column);
  }

  return stat;
}

function mapRow(row) {
  const stats = ROLES.map((descriptor) => buildStat(row, descriptor));

  if (stats[0].teamName === stats[1].teamName) {
    throw new Error(`Un equipo no puede enfrentarse a si mismo: ${stats[0].teamName}`);
  }

  return {
    seasonLabel: requireText(row, 'season'),
    playedOn: requireDate(row, 'date'),
    stats,
  };
}

module.exports = { mapRow };
