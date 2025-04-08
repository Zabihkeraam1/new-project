const fs = require('fs-extra');
const path = require('path');

const validateFilePath = (basePath, targetPath) => {
  const relative = path.relative(basePath, path.resolve(basePath, targetPath));
  return !relative.startsWith('..') && !path.isAbsolute(relative);
};

module.exports = {
  validateFilePath,
  async writeFileSafe(filePath, content) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  }
};