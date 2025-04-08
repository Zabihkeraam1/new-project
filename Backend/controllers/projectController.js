const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const {
  killProjectProcess,
  getRunningProjects,
} = require("../utils/processManager.js");
const { startReactApp } = require("../services/projectService.js");
const TEMPLATE_PATH = path.join(__dirname, "../react-template");
const PROJECTS_DIR = path.join(__dirname, "../projects");
const { validateFilePath, writeFileSafe } = require("../utils/fileHandler.js");
const Project = require("../models/projectModel.js");
const { overwriteViteConfig } = require("../services/overwriteViteConfig.js");
const { addServerBlock } = require("../utils/nginxConfigGenerator.js");
const { initializeGet, pushChanges } = require("../services/versionControl.js");

// Create new project controller

const createProject = async (req, res) => {
  console.log("Creating project...");
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: "Project name is required" });
  }

  const projectPath = path.join(PROJECTS_DIR, projectName);

  try {
    await fs.emptyDir(projectPath);

    await fs.copy(TEMPLATE_PATH, projectPath);

    const packagePath = path.join(projectPath, "package.json");
    const pkg = JSON.parse(await fs.readFile(packagePath, "utf8"));
    pkg.name = projectName;
    await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2));

    const totalProjects = await Project.countDocuments();

    const portNumber = totalProjects + 5000 + 1;

    const nginxPort = 8000 + totalProjects;
    const appPort = portNumber;

    addServerBlock(nginxPort, appPort);

    const vitePath = path.join(projectPath, "vite.config.ts");
    await overwriteViteConfig(vitePath, portNumber);

    await exec(`cd ${projectPath} && npm install`, { shell: "cmd.exe" });

    const { pid } = await startReactApp(projectPath);
    const result = await initializeGet(projectPath, projectName);

    const projectData = {
      name: projectName,
      processId: pid,
      port: portNumber,
      nginxUrl: `http://localhost:${nginxPort}`,
      url: `http://localhost:${portNumber}`,
      repoUrl: result,
      status: "active",
    };

    console.log("Saving Project:", projectData);
    await new Project(projectData).save();

    res.json({
      success: true,
      projectName,
      pid,
      port: portNumber,
      nginxUrl: `http://localhost:${nginxPort}`,
      url: `http://localhost:${portNumber}`,
      repoUrl: result,
    });
  } catch (error) {
    console.error("Error creating project:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update project controller
const updateProjectFiles = async (req, res) => {
  const { projectName } = req.params;
  const { files } = req.body;

  if (!projectName || !files || !Array.isArray(files)) {
    return res.status(400).json({
      success: false,
      error: "Project name and files array are required",
    });
  }

  const projectPath = path.join(__dirname, "../projects", projectName);

  try {
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          if (!validateFilePath(projectPath, file.path)) {
            throw new Error("Invalid file path");
          }
          const filePath = path.join(projectPath, file.path);
          await fs.ensureDir(path.dirname(filePath));
          await writeFileSafe(filePath, file.content);

          return {
            path: file.path,
            status: "success",
          };
        } catch (error) {
          return {
            path: file.path,
            status: "error",
            error: error.message,
          };
        }
      })
    );
    const merged = await pushChanges(projectPath);
    res.json({
      success: true,
      results,
      mergeMessages: merged,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const killProject = async (req, res) => {
  console.log("Killing project...", req.params);

  if (!req.params?.projectName) {
    console.error("Invalid params structure:", req.params);
    return res.status(400).json({
      success: false,
      error: "Invalid request format",
    });
  }
  const { projectName } = req.params;

  if (!projectName) {
    return res.status(400).json({
      success: false,
      error: "Project name is required",
    });
  }

  try {
    console.log("All running projects: ", getRunningProjects());
    const result = killProjectProcess(projectName);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Project not running",
      });
    }

    res.json({
      success: true,
      message: `Project ${projectName} terminated`,
      pid: result.pid,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  updateProjectFiles,
  killProject,
};
