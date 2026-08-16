import {
  findMentorsForSkill,
  findRecommendedPeers,
  findShortestConnectionPath,
  getDeveloperEgoGraph,
} from "../services/graphService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// GET /api/developers/:id/mentors — 3-hop traversal, explained in the root README
export const getMentors = asyncHandler(async (req, res) => {
  const mentors = await findMentorsForSkill(req.params.id);
  res.status(200).json(new ApiResponse(200, mentors, "Mentors fetched"));
});

// GET /api/developers/:id/recommendations
export const getRecommendations = asyncHandler(async (req, res) => {
  const peers = await findRecommendedPeers(req.params.id);
  res.status(200).json(new ApiResponse(200, peers, "Recommendations fetched"));
});

// GET /api/graph/path?from=X&to=Y — shortestPath() traversal
export const getShortestPath = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    throw new ApiError(
      400,
      'Query params "from" and "to" (developer ids) are required.',
    );
  }

  const path = await findShortestConnectionPath(from, to);
  if (!path) {
    throw new ApiError(
      404,
      `No connection found between "${from}" and "${to}".`,
    );
  }
  res.status(200).json(new ApiResponse(200, path, "Path found"));
});

// GET /api/developers/:id/graph — one-hop neighbourhood for the network view
export const getEgoGraph = asyncHandler(async (req, res) => {
  const graph = await getDeveloperEgoGraph(req.params.id);
  res.status(200).json(new ApiResponse(200, graph, "Ego graph fetched"));
});
