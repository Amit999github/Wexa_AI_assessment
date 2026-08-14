import * as projectService from "../services/projectService.js";

export async function listProjects(req, res, next) {
  try {
    res.json(await projectService.getAllProjects());
  } catch (err) {
    next(err);
  }
}

export async function getProjectTeam(req, res, next) {
  try {
    res.json(await projectService.getProjectTeam(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function getProjectDetail(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ error: `No project found with id "${req.params.id}"` });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
}
