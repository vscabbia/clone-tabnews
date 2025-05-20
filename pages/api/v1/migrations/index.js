import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = await getMigrationOptions(dbClient);

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: true,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = await getMigrationOptions(dbClient);

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}

async function getMigrationOptions(dbClient) {
  const defaultMigrationOptions = {
    dbClient: dbClient,
    databaseUrl: process.env.DATABASE_URL,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pg_migrations",
  };

  return defaultMigrationOptions;
}
