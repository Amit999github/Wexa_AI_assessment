import {
  getAllDevelopers,
  getDeveloperProfile as fetchDeveloperProfile,
} from "../services/developerService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// GET /api/developers
export const listDevelopers = asyncHandler(async (req, res) => {
  const developers = await getAllDevelopers();
  res.status(200).json(new ApiResponse(200, developers, "Developers fetched"));
});

// GET /api/developers/:id
export const getDeveloperProfile = asyncHandler(async (req, res) => {
  const profile = await fetchDeveloperProfile(req.params.id);
  if (!profile) {
    throw new ApiError(404, `No developer found with id "${req.params.id}"`);
  }
  res
    .status(200)
    .json(new ApiResponse(200, profile, "Developer profile fetched"));
});
