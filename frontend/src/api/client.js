const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new Error("Could not reach the server. Is the API running?");
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body — fall through to status-based message below
  }

  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

export const api = {
  getDevelopers: () => request("/developers"),
  getDeveloperProfile: (id) => request(`/developers/${id}`),
  getDeveloperGraph: (id) => request(`/developers/${id}/graph`),
  getMentors: (id) => request(`/developers/${id}/mentors`),
  getRecommendations: (id) => request(`/developers/${id}/recommendations`),
  getShortestPath: (fromId, toId) =>
    request(
      `/graph/path?from=${encodeURIComponent(fromId)}&to=${encodeURIComponent(toId)}`,
    ),
  getSkillDetail: (name) => request(`/skills/${encodeURIComponent(name)}`),
  getProjectDetail: (id) => request(`/projects/${encodeURIComponent(id)}`),
};
