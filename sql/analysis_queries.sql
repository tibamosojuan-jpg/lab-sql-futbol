USE football_analytics;

-- ---------------------------------------------------------------------------
-- A1. Tabla general acumulada: tres puntos por victoria, uno por empate.
-- El equipo con mas puntos, es tambien el que mas partidos ha disputado?
-- ---------------------------------------------------------------------------
SELECT t.name AS team,
       COUNT(*) AS played,
       SUM(CASE WHEN s.goals > o.goals THEN 3
                WHEN s.goals = o.goals THEN 1
                ELSE 0 END) AS points,
       ROUND(SUM(CASE WHEN s.goals > o.goals THEN 3
                      WHEN s.goals = o.goals THEN 1
                      ELSE 0 END) / COUNT(*), 3) AS points_per_game
FROM game_team_stat AS s
JOIN game_team_stat AS o ON o.game_id = s.game_id AND o.team_id <> s.team_id
JOIN team AS t ON t.id = s.team_id
GROUP BY t.id, t.name
ORDER BY points DESC
LIMIT 10;

-- ---------------------------------------------------------------------------
-- A2. Promedio de posesion en los partidos ganados por cada equipo.
-- ---------------------------------------------------------------------------
SELECT t.name AS team,
       COUNT(*) AS wins,
       ROUND(AVG(s.possession), 2) AS avg_possession_in_wins
FROM game_team_stat AS s
JOIN game_team_stat AS o ON o.game_id = s.game_id AND o.team_id <> s.team_id
JOIN team AS t ON t.id = s.team_id
WHERE s.goals > o.goals
GROUP BY t.id, t.name
HAVING wins >= 30
ORDER BY avg_possession_in_wins DESC;

-- A2 complemento: ganar con posesion minoritaria es raro o comun?
SELECT COUNT(*) AS total_wins,
       SUM(CASE WHEN s.possession < 50 THEN 1 ELSE 0 END) AS wins_with_minority_possession,
       ROUND(100 * SUM(CASE WHEN s.possession < 50 THEN 1 ELSE 0 END) / COUNT(*), 1) AS percentage
FROM game_team_stat AS s
JOIN game_team_stat AS o ON o.game_id = s.game_id AND o.team_id <> s.team_id
WHERE s.goals > o.goals;

-- ---------------------------------------------------------------------------
-- A3. Mayor diferencia entre tiros a puerta y goles en una misma temporada.
-- ---------------------------------------------------------------------------
SELECT t.name AS team,
       se.label AS season,
       SUM(s.shots_on_target) AS shots_on_target,
       SUM(s.goals) AS goals,
       SUM(s.shots_on_target) - SUM(s.goals) AS gap,
       ROUND(100 * SUM(s.goals) / SUM(s.shots_on_target), 1) AS conversion_rate
FROM game_team_stat AS s
JOIN game   AS g  ON g.id = s.game_id
JOIN season AS se ON se.id = g.season_id
JOIN team   AS t  ON t.id = s.team_id
GROUP BY t.id, t.name, se.id, se.label
ORDER BY gap DESC
LIMIT 10;

-- ---------------------------------------------------------------------------
-- A4. Temporada con mas tarjetas rojas y su relacion con los goles.
-- Se normaliza por partido porque la temporada 20/21 esta incompleta.
-- ---------------------------------------------------------------------------
SELECT se.label AS season,
       COUNT(DISTINCT g.id) AS games,
       SUM(s.red_cards) AS red_cards,
       SUM(s.goals) AS goals,
       ROUND(SUM(s.red_cards) / COUNT(DISTINCT g.id), 3) AS red_cards_per_game,
       ROUND(SUM(s.goals) / COUNT(DISTINCT g.id), 2) AS goals_per_game
FROM game_team_stat AS s
JOIN game   AS g  ON g.id = s.game_id
JOIN season AS se ON se.id = g.season_id
GROUP BY se.id, se.label
ORDER BY red_cards DESC;
