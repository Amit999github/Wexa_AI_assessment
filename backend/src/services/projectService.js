import { getSession } from "../config/db.js";

export async function getAllProjects() {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (p:Project) RETURN p.id AS id, p.name AS name, p.description AS description ORDER BY p.name`,
      ),
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
        { projectId },
      ),
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}

// project + its team + the skills it uses. returns null if it doesn't exist
export async function getProjectById(projectId) {
  const session = getSession();
  try {
    const projectResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (p:Project {id: $projectId})
         RETURN p.id AS id, p.name AS name, p.description AS description`,
        { projectId },
      ),
    );
    if (projectResult.records.length === 0) return null;

    const project = projectResult.records[0].toObject();

    const teamResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (p:Project {id: $projectId})<-[r:WORKED_ON]-(d:Developer)
         RETURN d.id AS id, d.name AS name, r.role AS role
         ORDER BY r.role`,
        { projectId },
      ),
    );

    const skillsResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (p:Project {id: $projectId})-[:USES_SKILL]->(s:Skill)
         RETURN s.name AS name, s.category AS category
         ORDER BY s.category, s.name`,
        { projectId },
      ),
    );

    return {
      ...project,
      team: teamResult.records.map((r) => r.toObject()),
      skills: skillsResult.records.map((r) => r.toObject()),
    };
  } finally {
    await session.close();
  }
}
