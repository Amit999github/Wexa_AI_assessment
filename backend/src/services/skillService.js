import { getSession } from '../config/db.js';

export async function getAllSkills() {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(`MATCH (s:Skill) RETURN s.name AS name, s.category AS category ORDER BY s.category, s.name`)
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}

/** Everyone with a given skill, most experienced first — used by the Skill detail page. */
export async function getDevelopersForSkill(skillName) {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (d:Developer)-[r:HAS_SKILL]->(s:Skill {name: $skillName})
         RETURN d.id AS id, d.name AS name, r.level AS level
         ORDER BY CASE r.level WHEN 'advanced' THEN 0 WHEN 'intermediate' THEN 1 ELSE 2 END`,
        { skillName }
      )
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}
