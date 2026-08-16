import {
  getAllProjects,
  getProjectTeam as fetchProjectTeam,
  getProjectById,
} from "../services/projectService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// GET /api/projects
export const listProjects = asyncHandler(async (req, res) => {
  const projects = await getAllProjects();
  res.status(200).json(new ApiResponse(200, projects, "Projects fetched"));
});

// GET /api/projects/:id/team
export const getProjectTeam = asyncHandler(async (req, res) => {
  const team = await fetchProjectTeam(req.params.id);
  res.status(200).json(new ApiResponse(200, team, "Project team fetched"));
});

// GET /api/projects/:id
export const getProjectDetail = asyncHandler(async (req, res) => {
  const project = await getProjectById(req.params.id);
  if (!project) {
    throw new ApiError(404, `No project found with id "${req.params.id}"`);
  }
  res.status(200).json(new ApiResponse(200, project, "Project fetched"));
});
