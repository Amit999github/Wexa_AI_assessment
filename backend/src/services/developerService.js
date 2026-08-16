import { getSession } from "../config/db.js";
import { serializeNode } from "../utils/serialize.js";

export async function getAllDevelopers() {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (d:Developer) RETURN d ORDER BY d.name`),
    );
    return result.records.map((r) => serializeNode(r.get("d")));
  } finally {
    await session.close();
  }
}

export async function getDeveloperById(id) {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (d:Developer {id: $id}) RETURN d`, { id }),
    );
    if (result.records.length === 0) return null;
    return serializeNode(result.records[0].get("d"));
  } finally {
    await session.close();
  }
}

// full profile: skills (with level), skills they want to learn, and projects
// worked on (with role). kept as three simple reads instead of one big query
export async function getDeveloperProfile(id) {
  const session = getSession();
  try {
    const developer = await session.executeRead((tx) =>
      tx.run(`MATCH (d:Developer {id: $id}) RETURN d`, { id }),
    );
    if (developer.records.length === 0) return null;

    const skillsResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (d:Developer {id: $id})-[r:HAS_SKILL]->(s:Skill)
         RETURN s.name AS name, s.category AS category, r.level AS level
         ORDER BY s.name`,
        { id },
      ),
    );

    const wantsResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (d:Developer {id: $id})-[:WANTS_TO_LEARN]->(s:Skill)
         RETURN s.name AS name, s.category AS category
         ORDER BY s.name`,
        { id },
      ),
    );

    const projectsResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (d:Developer {id: $id})-[r:WORKED_ON]->(p:Project)
         RETURN p.id AS id, p.name AS name, p.description AS description, r.role AS role
         ORDER BY p.name`,
        { id },
      ),
    );

    return {
      ...serializeNode(developer.records[0].get("d")),
      skills: skillsResult.records.map((r) => r.toObject()),
      wantsToLearn: wantsResult.records.map((r) => r.toObject()),
      projects: projectsResult.records.map((r) => r.toObject()),
    };
  } finally {
    await session.close();
  }
}
