const fs = require("fs-extra");
const overwriteViteConfig = async (vitePath, portNumber) => {
  try {
    const newConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
    port: ${portNumber},
    strictPort: true
  } 
});
`;

    // Overwrite the file
    await fs.writeFile(vitePath, newConfig, "utf8");
    console.log(`vite.config.ts has been updated with port: ${portNumber}`);
  } catch (error) {
    throw new Error(`Failed to overwrite vite.config.ts: ${error.message}`);
  }
};

module.exports = {overwriteViteConfig}