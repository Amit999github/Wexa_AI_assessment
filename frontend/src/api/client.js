import axios from "axios";

// single axios instance for the whole app instead of calling axios directly
// everywhere — makes it one place to change the base URL, headers, etc.
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// backend replies with { success, data, message } on every route — unwrap it
// here so the rest of the app just deals with the actual payload
instance.interceptors.response.use(
  (res) => res.data?.data,
  (err) => {
    if (!err.response) {
      // request never reached the server
      return Promise.reject(
        new Error("Could not reach the server. Is the API running?"),
      );
    }
    const message =
      err.response.data?.message || `Request failed (${err.response.status})`;
    return Promise.reject(new Error(message));
  },
);

export const api = {
  getDevelopers: () => instance.get("/developers"),
  getDeveloperProfile: (id) => instance.get(`/developers/${id}`),
  getDeveloperGraph: (id) => instance.get(`/developers/${id}/graph`),
  getMentors: (id) => instance.get(`/developers/${id}/mentors`),
  getRecommendations: (id) => instance.get(`/developers/${id}/recommendations`),
  getShortestPath: (fromId, toId) =>
    instance.get("/graph/path", { params: { from: fromId, to: toId } }),
  getSkillDetail: (name) => instance.get(`/skills/${encodeURIComponent(name)}`),
  getProjectDetail: (id) => instance.get(`/projects/${encodeURIComponent(id)}`),
};
