import { getSession } from '../config/db.js';

export async function getAllProjects() {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (p:Project) RETURN p.id AS id, p.name AS name, p.description AS description ORDER BY p.name`)
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}

export async function getProjectTeam(projectId) {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (p:Project {id: $projectId})<-[r:WORKED_ON]-(d:Developer)
         RETURN d.id AS id, d.name AS name, r.role AS role
         ORDER BY r.role`,
        { projectId }
      )
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}
