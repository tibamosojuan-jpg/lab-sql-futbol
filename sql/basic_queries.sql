USE football_analytics;

-- B1. Filtrado con dos condiciones.
-- Pregunta: en que participaciones un equipo anoto cuatro o mas goles
-- teniendo menos del 45% de la posesion?
SELECT t.name AS team, g.played_on, s.goals, s.possession, s.shots_on_target
FROM game_team_stat AS s
JOIN team AS t ON t.id = s.team_id
JOIN game AS g ON g.id = s.game_id
WHERE s.goals >= 4
  AND s.possession < 45
ORDER BY s.goals DESC, s.possession ASC
LIMIT 15;

-- B2. JOIN entre dos entidades (team, game_team_stat).
-- Pregunta: que equipos registran las diez posesiones mas altas del historico?
SELECT t.name AS team, s.possession, s.passes, s.goals
FROM game_team_stat AS s
JOIN team AS t ON t.id = s.team_id
ORDER BY s.possession DESC
LIMIT 10;

-- B3. JOIN entre cuatro entidades (team, game_team_stat, game, season).
-- Pregunta: cuantos goles anoto cada equipo en la temporada 20/21?
SELECT t.name AS team, se.label AS season, SUM(s.goals) AS goals
FROM game_team_stat AS s
JOIN team   AS t  ON t.id = s.team_id
JOIN game   AS g  ON g.id = s.game_id
JOIN season AS se ON se.id = g.season_id
WHERE se.label = '20/21'
GROUP BY t.id, t.name, se.label
ORDER BY goals DESC;

-- B4. Agregacion con GROUP BY.
-- Pregunta: como evoluciona la disciplina por temporada, medida en
-- tarjetas amarillas por partido?
SELECT se.label AS season,
       COUNT(DISTINCT g.id)                      AS games,
       SUM(s.yellow_cards)                       AS yellow_cards,
       ROUND(SUM(s.yellow_cards) / COUNT(DISTINCT g.id), 2) AS yellows_per_game
FROM game_team_stat AS s
JOIN game   AS g  ON g.id = s.game_id
JOIN season AS se ON se.id = g.season_id
GROUP BY se.id, se.label
ORDER BY yellows_per_game DESC;
