# Laboratorio: Modelado y Analisis de Datos con SQL

Transformacion del dataset plano `football\\\_matches.csv` (4.070 partidos de la
Premier League, temporadas 10/11 a 20/21) en un modelo relacional normalizado
en tercera forma normal, y explotacion de ese modelo mediante consultas SQL.

## Estructura

```
data/football\\\_matches.csv   Dataset asignado
sql/schema.sql              DDL del modelo normalizado
sql/basic\\\_queries.sql       Las cuatro consultas basicas exigidas
sql/analysis\\\_queries.sql    Las cuatro consultas de analisis del dataset de futbol
src/config.js               Parametros de conexion y mapeo de columnas del CSV
src/database.js             Pool de conexiones a MySQL
src/datasetReader.js        Lectura y parseo del CSV
src/rowMapper.js            Traduccion de una fila plana al modelo, con validacion
src/repository.js           Sentencias de insercion sobre cada tabla
src/loader.js               Orquestacion de la carga y reporte de rechazos
src/verify.js               Conteos por tabla y verificaciones de integridad
```

## Ejecucion

```bash
npm install
npm install dotenv
cp .env.example .env          # ajustar credenciales
mysql -u <usuario> -p < sql/schema.sql
npm run load
npm run verify
```

Las credenciales se leen del archivo `.env` mediante dotenv; no hay valores

sensibles en el codigo y el archivo esta excluido del control de versiones.

## Modelo

Cuatro tablas: `season`, `team`, `game` y `game\\\_team\\\_stat`.

`game\\\_team\\\_stat` es la tabla puente de la relacion N:M entre `game` y `team`.
Cada partido genera exactamente dos filas, una por bando, diferenciadas por la
columna `role`. La restriccion `UNIQUE (game\\\_id, role)` impide que un mismo
encuentro registre dos locales o dos visitantes.

## Columnas excluidas

* `X`: indice de fila del archivo, sin significado en el dominio.
* `sg\\\_match\\\_ft`: equivale a `goal\\\_home\\\_ft - goal\\\_away\\\_ft` en las 4.070 filas.
* `result`: el desenlace se deduce de los goles de ambos bandos.

Las tres son dependencias transitivas sobre los goles y su almacenamiento
introduce riesgo de inconsistencia.

## Decision arquitectonica del programa de carga

La carga es un proceso ETL de ejecucion unica, sin superficie HTTP ni consumo
desde un cliente. Montar rutas y controladores sobre el no aportaria estructura
sino ceremonia vacia. Se implemento como script independiente, pero conservando
la separacion de responsabilidades por modulo: lectura del origen, traduccion al
modelo, persistencia y orquestacion viven en archivos distintos.

## Verificacion de la carga

```
Temporadas: 11
Equipos: 37
Partidos: 4070
Participaciones: 8140
```

`src/verify.js` comprueba ademas que todo partido tenga exactamente dos
participantes y que la posesion de cada encuentro sume 100.

