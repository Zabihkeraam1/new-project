const { exec } = require('child_process');
const startReactApp = async (projectPath) => {
    const winPath = projectPath.replace(/\//g, '\\');
    
    return new Promise((resolve) => {
        const child = exec(
            `cd /d ${winPath} && npm run dev`,
            {
                shell: 'cmd.exe',
                detached: true,
                env: { ...process.env }
            },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error starting project: ${stderr}`);
                    resolve({ pid: null });
                }
            }
        );

        resolve({ pid: child.pid });
    });
};

module.exports = { startReactApp };