import { getSession } from "../config/db.js";

export async function getAllSkills() {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (s:Skill) RETURN s.name AS name, s.category AS category ORDER BY s.category, s.name`,
      ),
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
        { skillName },
      ),
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}

/** Detail for a single skill: the skill itself, developers who have it, and
 *  projects that use it. Returns null if the skill does not exist. */
export async function getSkillByName(skillName) {
  const session = getSession();
  try {
    const skillResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (s:Skill {name: $skillName})
         RETURN s.name AS name, s.category AS category`,
        { skillName },
      ),
    );
    if (skillResult.records.length === 0) return null;

    const skill = skillResult.records[0].toObject();

    const devsResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (d:Developer)-[r:HAS_SKILL]->(s:Skill {name: $skillName})
         RETURN d.id AS id, d.name AS name, r.level AS level
         ORDER BY CASE r.level
           WHEN 'advanced' THEN 0
           WHEN 'intermediate' THEN 1
           ELSE 2
         END`,
        { skillName },
      ),
    );

    const projectsResult = await session.executeRead((tx) =>
      tx.run(
        `MATCH (p:Project)-[:USES_SKILL]->(s:Skill {name: $skillName})
         RETURN p.id AS id, p.name AS name
         ORDER BY p.name`,
        { skillName },
      ),
    );

    return {
      ...skill,
      developers: devsResult.records.map((r) => r.toObject()),
      projects: projectsResult.records.map((r) => r.toObject()),
    };
  } finally {
    await session.close();
  }
}
