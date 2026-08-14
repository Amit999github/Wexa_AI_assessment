import neo4j from 'neo4j-driver';

/** Neo4j node -> plain object the frontend can consume directly. */
export function serializeNode(node) {
  return {
    id: neo4j.integer.toString(node.identity),
    labels: node.labels,
    ...node.properties,
  };
}

/** Neo4j relationship -> plain object, keeping the driver's start/end ids
 * so a frontend graph library can wire edges back to the nodes above. */
export function serializeRelationship(rel) {
  return {
    id: neo4j.integer.toString(rel.identity),
    type: rel.type,
    source: neo4j.integer.toString(rel.start),
    target: neo4j.integer.toString(rel.end),
    ...rel.properties,
  };
}

/**
 * Serializes a Cypher `path` value (as returned by e.g. shortestPath()) into
 * { nodes, relationships } arrays of plain objects.
 */
export function serializePath(path) {
  return {
    nodes: path.segments.length
      ? [path.start, ...path.segments.map((s) => s.end)].map(serializeNode)
      : [serializeNode(path.start)],
    relationships: path.segments.map((s) => serializeRelationship(s.relationship)),
  };
}
