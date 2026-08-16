// Realistic, hand-crafted seed data for the Developer Skill & Mentor Matching graph.
// Small enough to eyeball and verify by hand, big enough to make the multi-hop
// queries return genuinely interesting (non-trivial) results.

export const developers = [
  {
    id: "dev1",
    name: "Amit Verma",
    bio: "MERN stack developer who loves building payment-heavy backends.",
  },
  {
    id: "dev2",
    name: "Priya Nair",
    bio: "Frontend engineer focused on design systems and accessibility.",
  },
  {
    id: "dev3",
    name: "Rahul Mehta",
    bio: "Backend engineer, deep into distributed systems and Go.",
  },
  {
    id: "dev4",
    name: "Sneha Kulkarni",
    bio: "Full-stack developer, recently picked up GraphQL and Next.js.",
  },
  {
    id: "dev5",
    name: "Arjun Malhotra",
    bio: "DevOps engineer, Kubernetes and CI/CD pipelines.",
  },
  {
    id: "dev6",
    name: "Fatima Sheikh",
    bio: "ML engineer working on recommendation systems.",
  },
  {
    id: "dev7",
    name: "Karan Desai",
    bio: "Junior developer, strong in React, learning backend fundamentals.",
  },
  {
    id: "dev8",
    name: "Neha Joshi",
    bio: "Database specialist, PostgreSQL and query optimization.",
  },
  {
    id: "dev9",
    name: "Vikram Rao",
    bio: "Security-focused backend engineer, JWT/OAuth expert.",
  },
  {
    id: "dev10",
    name: "Ananya Iyer",
    bio: "Product-minded full-stack developer, UX + Tailwind.",
  },
];

export const skills = [
  { name: "React", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "Express", category: "Backend" },
  { name: "MongoDB", category: "Database" },
  { name: "PostgreSQL", category: "Database" },
  { name: "GraphQL", category: "Backend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Docker", category: "DevOps" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "CI/CD", category: "DevOps" },
  { name: "Go", category: "Language" },
  { name: "Python", category: "Language" },
  { name: "Machine Learning", category: "AI/ML" },
  { name: "JWT/OAuth", category: "Security" },
  { name: "System Design", category: "Architecture" },
  { name: "Redux", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
];

export const projects = [
  {
    id: "proj1",
    name: "PayFlow",
    description: "Payment gateway integration service for e-commerce checkout.",
  },
  {
    id: "proj2",
    name: "DesignKit",
    description: "Internal design system and component library.",
  },
  {
    id: "proj3",
    name: "Orion",
    description: "Distributed order-processing microservice.",
  },
  {
    id: "proj4",
    name: "RecoEngine",
    description: "Recommendation engine for a content platform.",
  },
  {
    id: "proj5",
    name: "DeployHub",
    description: "Internal CI/CD and Kubernetes deployment tooling.",
  },
  {
    id: "proj6",
    name: "QueryOpt",
    description: "Query optimization and analytics dashboard for Postgres.",
  },
];

// (Developer)-[:HAS_SKILL {level}]->(Skill)
export const hasSkill = [
  { devId: "dev1", skillName: "Node.js", level: "advanced" },
  { devId: "dev1", skillName: "Express", level: "advanced" },
  { devId: "dev1", skillName: "MongoDB", level: "advanced" },
  { devId: "dev1", skillName: "JWT/OAuth", level: "intermediate" },
  { devId: "dev1", skillName: "React", level: "intermediate" },

  { devId: "dev2", skillName: "React", level: "advanced" },
  { devId: "dev2", skillName: "Tailwind CSS", level: "advanced" },
  { devId: "dev2", skillName: "Next.js", level: "intermediate" },
  { devId: "dev2", skillName: "Redux", level: "intermediate" },

  { devId: "dev3", skillName: "Go", level: "advanced" },
  { devId: "dev3", skillName: "System Design", level: "advanced" },
  { devId: "dev3", skillName: "PostgreSQL", level: "intermediate" },
  { devId: "dev3", skillName: "Docker", level: "intermediate" },

  { devId: "dev4", skillName: "GraphQL", level: "advanced" },
  { devId: "dev4", skillName: "Next.js", level: "advanced" },
  { devId: "dev4", skillName: "TypeScript", level: "intermediate" },
  { devId: "dev4", skillName: "React", level: "intermediate" },

  { devId: "dev5", skillName: "Docker", level: "advanced" },
  { devId: "dev5", skillName: "Kubernetes", level: "advanced" },
  { devId: "dev5", skillName: "CI/CD", level: "advanced" },
  { devId: "dev5", skillName: "Python", level: "intermediate" },

  { devId: "dev6", skillName: "Machine Learning", level: "advanced" },
  { devId: "dev6", skillName: "Python", level: "advanced" },
  { devId: "dev6", skillName: "PostgreSQL", level: "intermediate" },

  { devId: "dev7", skillName: "React", level: "intermediate" },
  { devId: "dev7", skillName: "Tailwind CSS", level: "beginner" },

  { devId: "dev8", skillName: "PostgreSQL", level: "advanced" },
  { devId: "dev8", skillName: "System Design", level: "intermediate" },
  { devId: "dev8", skillName: "MongoDB", level: "beginner" },

  { devId: "dev9", skillName: "JWT/OAuth", level: "advanced" },
  { devId: "dev9", skillName: "Node.js", level: "intermediate" },
  { devId: "dev9", skillName: "System Design", level: "intermediate" },

  { devId: "dev10", skillName: "Tailwind CSS", level: "advanced" },
  { devId: "dev10", skillName: "React", level: "advanced" },
  { devId: "dev10", skillName: "TypeScript", level: "beginner" },
];

// (Developer)-[:WANTS_TO_LEARN]->(Skill)
export const wantsToLearn = [
  { devId: "dev7", skillName: "Node.js" },
  { devId: "dev7", skillName: "System Design" },
  { devId: "dev2", skillName: "TypeScript" },
  { devId: "dev8", skillName: "Machine Learning" },
  { devId: "dev10", skillName: "GraphQL" },
  { devId: "dev6", skillName: "Kubernetes" },
];

// (Developer)-[:WORKED_ON {role}]->(Project)
export const workedOn = [
  { devId: "dev1", projectId: "proj1", role: "Lead" },
  { devId: "dev9", projectId: "proj1", role: "Security Engineer" },

  { devId: "dev2", projectId: "proj2", role: "Lead" },
  { devId: "dev10", projectId: "proj2", role: "Contributor" },
  { devId: "dev7", projectId: "proj2", role: "Contributor" },

  { devId: "dev3", projectId: "proj3", role: "Lead" },
  { devId: "dev1", projectId: "proj3", role: "Backend Engineer" },
  { devId: "dev7", projectId: "proj3", role: "Contributor" },

  { devId: "dev6", projectId: "proj4", role: "Lead" },
  { devId: "dev4", projectId: "proj4", role: "Contributor" },

  { devId: "dev5", projectId: "proj5", role: "Lead" },
  { devId: "dev3", projectId: "proj5", role: "Contributor" },

  { devId: "dev8", projectId: "proj6", role: "Lead" },
  { devId: "dev4", projectId: "proj6", role: "Contributor" },
];

// (Project)-[:USES_SKILL]->(Skill)
export const projectUsesSkill = [
  { projectId: "proj1", skillName: "Node.js" },
  { projectId: "proj1", skillName: "Express" },
  { projectId: "proj1", skillName: "MongoDB" },
  { projectId: "proj1", skillName: "JWT/OAuth" },

  { projectId: "proj2", skillName: "React" },
  { projectId: "proj2", skillName: "Tailwind CSS" },
  { projectId: "proj2", skillName: "TypeScript" },

  { projectId: "proj3", skillName: "Go" },
  { projectId: "proj3", skillName: "System Design" },
  { projectId: "proj3", skillName: "Docker" },
  { projectId: "proj3", skillName: "Node.js" },

  { projectId: "proj4", skillName: "Machine Learning" },
  { projectId: "proj4", skillName: "Python" },
  { projectId: "proj4", skillName: "PostgreSQL" },

  { projectId: "proj5", skillName: "Docker" },
  { projectId: "proj5", skillName: "Kubernetes" },
  { projectId: "proj5", skillName: "CI/CD" },

  { projectId: "proj6", skillName: "PostgreSQL" },
  { projectId: "proj6", skillName: "System Design" },
];
