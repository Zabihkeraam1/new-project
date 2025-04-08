const express = require("express");
const {
  createProject,
  updateProjectFiles,
  killProject,
} = require("../controllers/projectController");
const { mergeDevToMaster } = require("../services/versionControl.js");
const projectRouter = express.Router();

projectRouter.post("/setup-project", createProject);
projectRouter.put("/:projectName/files", updateProjectFiles);
projectRouter.delete("/:projectName", killProject);
projectRouter.post("/merge-dev-to-master/:projectId", mergeDevToMaster);

module.exports = projectRouter;
