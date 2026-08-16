import {
  getAllSkills,
  getDevelopersForSkill,
  getSkillByName,
} from "../services/skillService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// GET /api/skills
export const listSkills = asyncHandler(async (req, res) => {
  const skills = await getAllSkills();
  res.status(200).json(new ApiResponse(200, skills, "Skills fetched"));
});

// GET /api/skills/:name/developers
export const listDevelopersForSkill = asyncHandler(async (req, res) => {
  const developers = await getDevelopersForSkill(req.params.name);
  res.status(200).json(new ApiResponse(200, developers, "Developers fetched"));
});

// GET /api/skills/:name
export const getSkillDetail = asyncHandler(async (req, res) => {
  const skill = await getSkillByName(req.params.name);
  if (!skill) {
    throw new ApiError(404, `No skill found with name "${req.params.name}"`);
  }
  res.status(200).json(new ApiResponse(200, skill, "Skill fetched"));
});
