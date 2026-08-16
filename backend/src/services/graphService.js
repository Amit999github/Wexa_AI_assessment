import { getSession } from "../config/db.js";
import {
  serializeNode,
  serializeRelationship,
  serializePath,
  serializeGraphNode,
  serializeGraphRelationship,
} from "../utils/serialize.js";

// 3-hop traversal: a developer wants to learn a skill -> find people they've
// already worked with on a project who happen to have that skill. This is
// the "find a mentor through someone I already know" query — a relational
// schema would need several JOINs and still return a much less natural shape.
export async function findMentorsForSkill(devId) {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (me:Developer {id: $devId})-[:WANTS_TO_LEARN]->(target:Skill)
         MATCH (me)-[:WORKED_ON]->(proj:Project)<-[:WORKED_ON]-(peer:Developer)-[:HAS_SKILL]->(target)
         WHERE peer.id <> $devId
         RETURN DISTINCT peer.id AS peerId, peer.name AS peerName, target.name AS skillName,
                proj.name AS sharedProject
         ORDER BY target.name, peer.name`,
        { devId },
      ),
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}

// developers who share a skill with me but I've never worked on a project
// with — deliberately excludes anyone already one project-hop away, so it
// needs a NOT EXISTS subquery over a graph pattern, not just a JOIN.
export async function findRecommendedPeers(devId) {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (me:Developer {id: $devId})-[:HAS_SKILL]->(shared:Skill)<-[:HAS_SKILL]-(peer:Developer)
         WHERE peer.id <> $devId
           AND NOT EXISTS {
             MATCH (me)-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(peer)
           }
         RETURN DISTINCT peer.id AS peerId, peer.name AS peerName,
                collect(DISTINCT shared.name) AS sharedSkills
         ORDER BY size(sharedSkills) DESC, peer.name`,
        { devId },
      ),
    );
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}

// variable-length shortest path between two developers over WORKED_ON or
// HAS_SKILL edges. This is the query a relational DB genuinely struggles
// with (unbounded-depth search); Cypher does it in one line with shortestPath().
export async function findShortestConnectionPath(fromId, toId) {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (a:Developer {id: $fromId}), (b:Developer {id: $toId})
         MATCH path = shortestPath((a)-[:WORKED_ON|HAS_SKILL*..8]-(b))
         RETURN path`,
        { fromId, toId },
      ),
    );
    if (result.records.length === 0) return null;
    return serializePath(result.records[0].get("path"));
  } finally {
    await session.close();
  }
}

// a developer's one-hop neighbourhood, shaped as { nodes, edges } for the
// force-directed graph view on the frontend instead of flat rows
export async function getDeveloperEgoGraph(devId) {
  const session = getSession();
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `MATCH (me:Developer {id: $devId})
         OPTIONAL MATCH (me)-[hs:HAS_SKILL]->(skill:Skill)
         OPTIONAL MATCH (me)-[wl:WANTS_TO_LEARN]->(wantSkill:Skill)
         OPTIONAL MATCH (me)-[wo:WORKED_ON]->(proj:Project)
         OPTIONAL MATCH (proj)<-[peerWo:WORKED_ON]-(peer:Developer)
         WHERE peer.id <> $devId
         RETURN me, hs, skill, wl, wantSkill, wo, proj, peerWo, peer`,
        { devId },
      ),
    );

    const nodes = new Map();
    const edges = new Map();

    const addNode = (node) => {
      if (!node) return;
      const serialized = serializeGraphNode(node);
      nodes.set(serialized._id, serialized);
    };
    const addEdge = (rel) => {
      if (!rel) return;
      const serialized = serializeGraphRelationship(rel);
      edges.set(serialized.id, serialized);
    };

    for (const record of result.records) {
      addNode(record.get("me"));
      addNode(record.get("skill"));
      addNode(record.get("wantSkill"));
      addNode(record.get("proj"));
      addNode(record.get("peer"));
      addEdge(record.get("hs"));
      addEdge(record.get("wl"));
      addEdge(record.get("wo"));
      addEdge(record.get("peerWo"));
    }

    return { nodes: [...nodes.values()], edges: [...edges.values()] };
  } finally {
    await session.close();
  }
}
