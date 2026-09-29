const fs = require('fs');
const { parse } = require('csv-parse');

async function readDataset(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontro el dataset en ${filePath}`);
  }

  const rows = [];
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

  for await (const row of parser) {
    rows.push(row);
  }

  if (rows.length === 0) {
    throw new Error('El dataset no contiene registros');
  }

  return rows;
}

module.exports = { readDataset };
