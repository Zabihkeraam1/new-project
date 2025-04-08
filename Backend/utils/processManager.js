
// const runningProjects = new Map();

// function killProjectProcess(projectName) {
//   const project = runningProjects.get(projectName);
//   if (!project) return null;

//   try {
//     project.process.kill();
//     runningProjects.delete(projectName); 
//     return { pid: project.pid };
//   } catch (error) {
//     throw new Error(`Failed to kill process: ${error.message}`);
//   }
// }


// module.exports = {
//     killProjectProcess
// };

const runningProjects = new Map();

// Kill a specific project
function killProjectProcess(projectName) {
  const project = runningProjects.get(projectName);
  if (!project) return null;

  try {
    project.process.kill();
    runningProjects.delete(projectName);
    return { 
      pid: project.pid,
      name: projectName,
      status: 'terminated' 
    };
  } catch (error) {
    throw new Error(`Failed to kill process: ${error.message}`);
  }
}

// Get all running projects
function getRunningProjects() {
  return Array.from(runningProjects.entries()).map(([name, details]) => ({
    name,
    pid: details.pid,
    port: details.port,
    url: details.url,
    startTime: details.startTime
  }));
}

// Add a new project to tracking
function addProject(projectName, projectData) {
  runningProjects.set(projectName, {
    ...projectData,
    startTime: new Date().toISOString()
  });
}

module.exports = {
  killProjectProcess,
  getRunningProjects,
  addProject
};