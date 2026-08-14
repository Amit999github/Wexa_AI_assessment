import * as skillService from "../services/skillService.js";

export async function listSkills(req, res, next) {
  try {
    res.json(await skillService.getAllSkills());
  } catch (err) {
    next(err);
  }
}

export async function listDevelopersForSkill(req, res, next) {
  try {
    res.json(await skillService.getDevelopersForSkill(req.params.name));
  } catch (err) {
    next(err);
  }
}

export async function getSkillDetail(req, res, next) {
  try {
    const skill = await skillService.getSkillByName(req.params.name);
    if (!skill) {
      return res
        .status(404)
        .json({ error: `No skill found with name "${req.params.name}"` });
    }
    res.json(skill);
  } catch (err) {
    next(err);
  }
}
