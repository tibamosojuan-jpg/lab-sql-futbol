require('dotenv').config();
const path = require('path');

const DATASET_PATH = process.env.DATASET_PATH
  || path.join(__dirname, '..', 'data', 'football_matches.csv');

const database = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'football_analytics',
};

// Columnas del CSV que se cargan, agrupadas por el bando al que pertenecen
const SIDE_COLUMNS = {
  goals: 'goal_{role}_ft',
  possession: '{side}_possession',
  shots: '{side}_shots',
  shots_on_target: '{side}_shots_on_target',
  passes: '{side}_passes',
  touches: '{side}_touches',
  tackles: '{side}_tackles',
  clearances: '{side}_clearances',
  corners: '{side}_corners',
  offsides: '{side}_offsides',
  fouls_conceded: '{side}_fouls_conceded',
  yellow_cards: '{side}_yellow_cards',
  red_cards: '{side}_red_cards',
};

module.exports = { DATASET_PATH, database, SIDE_COLUMNS };
