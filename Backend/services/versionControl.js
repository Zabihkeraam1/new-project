const fs = require("fs-extra");
const path = require("path");
const simpleGit = require("simple-git");
const axios = require("axios");
const dotenv = require("dotenv");
const Project = require("../models/projectModel.js");
dotenv.config(".env");
const { GITHUB_USERNAME, GITHUB_TOKEN } = process.env;
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

const initializeGet = async (projectPath, projectName) => {
  const git = simpleGit(projectPath);
  console.log("Initializing Git and pushing to GitHub...");
  console.log("GITHUB_USERNAME", GITHUB_USERNAME, GITHUB_TOKEN);
  const isGitRepo = () => fs.existsSync(path.join(projectPath, ".git"));
  try {
    console.log("isGitRepo", isGitRepo());
    if (!isGitRepo()) {
      await git.init();
      fs.writeFileSync(
        path.join(projectPath, ".gitignore"),
        "node_modules/\n.env\n"
      );
      console.log("Git initialized.");
    }

    const repoResponse = await axios.post(
      "https://api.github.com/user/repos",
      { name: projectName, private: false },
      { headers }
    );

    const repoUrl = repoResponse.data.clone_url;

    await git.addRemote("origin", repoUrl);

    try {
      await git.checkoutLocalBranch("master");
      console.log("Master branch is empty.");
    } catch (err) {
      console.log("Creating master branch...");
      await git.checkoutInit("master");
      console.log("Master branch created.");
    }

    await git.add("./README.md");
    await git.commit("Initial commit on master");
    await git.push("origin", "master");

    await git.checkoutLocalBranch("dev");
    await git.add(".");
    await git.commit("Initial commit on dev");
    await git.push("origin", "dev");

    return repoUrl;
  } catch (err) {
    throw new Error(`Git Initialization Failed: ${err.message}`);
  }
};

// Push new changes to the remote
const pushChanges = async (projectPath, branch = "dev") => {
  const git = simpleGit(projectPath);
  try {
    await git.add(".");
    await git.commit("Automated commit");
    await git.push("origin", branch);

    return {
      success: true,
      message: `Successfully pushed changes to ${branch}`,
      branch,
    };
  } catch (err) {
    return {
      success: false,
      message: "Push failed",
      error: err.message,
      branch,
    };
  }
};

// Merge dev into master
const mergeDevToMaster = async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  console.log("Project found:", project.repoUrl);
  console.log("Project found:", project.name);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found!",
    });
  }

  try {
    const repoName = project.repoUrl.split("/").pop().replace(".git", "");
    const mergeUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/merges`;
    const mergeResponse = await axios.post(
      mergeUrl,
      {
        base: "master",
        head: "dev",
        commit_message: "Merge dev into master (Automated)",
      },
      { headers }
    );

    res.status(200).json({
      success: true,
      message: "Successfully merged dev into master!",
      data: mergeResponse.data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Merge failed!",
      error: err.response?.data?.message || err.message,
    });
  }
};

module.exports = { initializeGet, pushChanges, mergeDevToMaster };
