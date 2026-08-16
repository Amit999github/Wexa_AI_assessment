import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const { BOLT_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env;

if (!BOLT_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
  console.error(
    "[db] Missing CognoDB connection env vars. Copy .env.example to .env and fill in BOLT_URI, NEO4J_USER, NEO4J_PASSWORD.",
  );
}

const driver = neo4j.driver(
  BOLT_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 20,
    connectionAcquisitionTimeout: 10_000,
  },
);

// pings CognoDB so failures show up clearly at startup / on /health,
// instead of as a generic 500 the first time a query actually runs
export async function verifyConnectivity() {
  await driver.verifyConnectivity();
}

// opens a session for a single request — callers close it in a finally block
export function getSession() {
  return driver.session();
}

export async function closeDriver() {
  await driver.close();
}

export default driver;
