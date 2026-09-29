-- Modelo relacional normalizado en 3FN para el analisis de partidos de futbol.
-- Ejecutar con: mysql -u <usuario> -p < sql/schema.sql

DROP DATABASE IF EXISTS football_analytics;
CREATE DATABASE football_analytics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE football_analytics;

CREATE TABLE season (
  id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  label      CHAR(5)           NOT NULL,
  started_on DATE              NOT NULL,
  ended_on   DATE              NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_season_label (label),
  CONSTRAINT chk_season_range CHECK (ended_on >= started_on)
) ENGINE = InnoDB;

CREATE TABLE team (
  id   SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(60)       NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_team_name (name)
) ENGINE = InnoDB;

CREATE TABLE game (
  id        INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  season_id SMALLINT UNSIGNED NOT NULL,
  played_on DATE              NOT NULL,
  PRIMARY KEY (id),
  KEY idx_game_season (season_id),
  KEY idx_game_played_on (played_on),
  CONSTRAINT fk_game_season FOREIGN KEY (season_id) REFERENCES season (id)
) ENGINE = InnoDB;

CREATE TABLE game_team_stat (
  game_id         INT UNSIGNED        NOT NULL,
  team_id         SMALLINT UNSIGNED   NOT NULL,
  role            ENUM('home','away') NOT NULL,
  goals           TINYINT UNSIGNED    NOT NULL,
  possession      DECIMAL(4,1)        NOT NULL,
  shots           SMALLINT UNSIGNED   NOT NULL,
  shots_on_target SMALLINT UNSIGNED   NOT NULL,
  passes          SMALLINT UNSIGNED   NOT NULL,
  touches         SMALLINT UNSIGNED   NOT NULL,
  tackles         SMALLINT UNSIGNED   NOT NULL,
  clearances      SMALLINT UNSIGNED   NOT NULL,
  corners         TINYINT UNSIGNED    NOT NULL,
  offsides        TINYINT UNSIGNED    NOT NULL,
  fouls_conceded  TINYINT UNSIGNED    NOT NULL,
  yellow_cards    TINYINT UNSIGNED    NOT NULL,
  red_cards       TINYINT UNSIGNED    NOT NULL,
  PRIMARY KEY (game_id, team_id),
  UNIQUE KEY uq_game_role (game_id, role),
  KEY idx_stat_team (team_id),
  CONSTRAINT fk_stat_game FOREIGN KEY (game_id) REFERENCES game (id) ON DELETE CASCADE,
  CONSTRAINT fk_stat_team FOREIGN KEY (team_id) REFERENCES team (id),
  CONSTRAINT chk_possession_range CHECK (possession BETWEEN 0 AND 100),
  CONSTRAINT chk_shots_on_target CHECK (shots_on_target <= shots)
) ENGINE = InnoDB;
