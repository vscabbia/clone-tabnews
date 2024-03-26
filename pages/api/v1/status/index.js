import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const postgresVersion = (await database.query("SHOW server_version")).rows[0]
    .server_version;

  const databaseName = process.env.POSTGRES_DB;

  const postgresOpenedConn = (
    await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    })
  ).rows[0].count;

  const postgresMaxConn = (await database.query("SHOW max_connections;"))
    .rows[0].max_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: postgresVersion,
        open_connections: postgresOpenedConn,
        max_connections: parseInt(postgresMaxConn),
      },
    },
  });
}

export default status;
