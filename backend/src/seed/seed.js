import driver, { closeDriver } from "../config/db.js";
import {
  developers,
  skills,
  projects,
  hasSkill,
  wantsToLearn,
  workedOn,
  projectUsesSkill,
} from "./seedData.js";

// one parameterised, batched write per statement via UNWIND instead of
// looping session.run() per row — far fewer round trips
async function run(session, cypher, params = {}) {
  await session.executeWrite((tx) => tx.run(cypher, params));
}

async function createConstraints(session) {
  await run(
    session,
    `CREATE CONSTRAINT developer_id IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE`,
  );
  await run(
    session,
    `CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE`,
  );
  await run(
    session,
    `CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE`,
  );
}

async function seed() {
  const session = driver.session();
  try {
    console.log("[seed] Verifying connection to CognoDB...");
    await driver.verifyConnectivity();
    console.log("[seed] Connected. Creating constraints...");
    await createConstraints(session);

    console.log(`[seed] Loading ${developers.length} developers...`);
    await run(
      session,
      `UNWIND $rows AS row
       MERGE (d:Developer {id: row.id})
       SET d.name = row.name, d.bio = row.bio`,
      { rows: developers },
    );

    console.log(`[seed] Loading ${skills.length} skills...`);
    await run(
      session,
      `UNWIND $rows AS row
       MERGE (s:Skill {name: row.name})
       SET s.category = row.category`,
      { rows: skills },
    );

    console.log(`[seed] Loading ${projects.length} projects...`);
    await run(
      session,
      `UNWIND $rows AS row
       MERGE (p:Project {id: row.id})
       SET p.name = row.name, p.description = row.description`,
      { rows: projects },
    );

    console.log(`[seed] Loading ${hasSkill.length} HAS_SKILL relationships...`);
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (d:Developer {id: row.devId}), (s:Skill {name: row.skillName})
       MERGE (d)-[r:HAS_SKILL]->(s)
       SET r.level = row.level`,
      { rows: hasSkill },
    );

    console.log(
      `[seed] Loading ${wantsToLearn.length} WANTS_TO_LEARN relationships...`,
    );
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (d:Developer {id: row.devId}), (s:Skill {name: row.skillName})
       MERGE (d)-[:WANTS_TO_LEARN]->(s)`,
      { rows: wantsToLearn },
    );

    console.log(`[seed] Loading ${workedOn.length} WORKED_ON relationships...`);
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (d:Developer {id: row.devId}), (p:Project {id: row.projectId})
       MERGE (d)-[r:WORKED_ON]->(p)
       SET r.role = row.role`,
      { rows: workedOn },
    );

    console.log(
      `[seed] Loading ${projectUsesSkill.length} USES_SKILL relationships...`,
    );
    await run(
      session,
      `UNWIND $rows AS row
       MATCH (p:Project {id: row.projectId}), (s:Skill {name: row.skillName})
       MERGE (p)-[:USES_SKILL]->(s)`,
      { rows: projectUsesSkill },
    );

    console.log("[seed] Done. Graph is ready.");
  } catch (err) {
    console.error("[seed] Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await closeDriver();
  }
}

seed();
