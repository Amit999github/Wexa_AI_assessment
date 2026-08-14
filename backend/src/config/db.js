import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const { BOLT_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env;

if (!BOLT_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
  // Don't crash the process here — server.js decides how to handle a missing
  // connection so the app can still boot and report a clear health-check error
  // instead of dying silently before Express even starts.
  console.error(
    '[db] Missing CognoDB connection env vars. Copy .env.example to .env and fill in BOLT_URI, NEO4J_USER, NEO4J_PASSWORD.'
  );
}

// CognoDB speaks Bolt and works with the standard Neo4j driver — no custom SDK needed.
const driver = neo4j.driver(
  BOLT_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 20,
    connectionAcquisitionTimeout: 10_000,
  }
);

/**
 * Confirms the driver can actually reach CognoDB. Called once at startup and
 * from the /health route so failures surface clearly instead of as a generic
 * 500 the first time a query runs.
 */
export async function verifyConnectivity() {
  await driver.verifyConnectivity();
}

/**
 * Opens a new session for a single request. Callers are responsible for
 * closing it (session.close()) — services below do this in a finally block.
 */
export function getSession() {
  return driver.session();
}

export async function closeDriver() {
  await driver.close();
}

export default driver;
