const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const SITES_ENABLED_DIR = "C:/nginx/conf/sites-enabled/";
const NGINX_CONF_PATH = "C:/nginx/conf/nginx.conf";
const TEMPLATE = `
server {
    listen {{port}};
    server_name localhost;

    location / {
        proxy_pass http://localhost:{{appPort}};
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
`;

function addServerBlock(nginxPort, appPort) {
  const configPath = path.join(SITES_ENABLED_DIR, `app-${nginxPort}.conf`);

  // Generate server block with the correct ports
  const newConfig = TEMPLATE.replace("{{port}}", nginxPort).replace(
    "{{appPort}}",
    appPort
  );

  // Write new site-specific Nginx config
  fs.writeFileSync(configPath, newConfig, "utf8");
  console.log(`Nginx config written: ${configPath}`);

  // Reload Nginx to apply changes
  exec(
    `${NGINX_CONF_PATH} -s reload`,
    {
      shell: "cmd.exe",
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error reloading Nginx: ${stderr}`);
        return;
      }
      console.log("✅ Nginx reloaded successfully");
    }
  );
}

module.exports = { addServerBlock };

// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');

// const NGINX_CONF_PATH = 'C:/nginx/conf/nginx.conf';
// const TEMPLATE = `
//     server {
//         listen {{port}};
//         server_name localhost;

//         location / {
//             proxy_pass http://localhost:{{appPort}};
//             proxy_set_header Host $host;
//             proxy_http_version 1.1;
//             proxy_set_header Upgrade $http_upgrade;
//             proxy_set_header Connection "upgrade";
//         }
//     }
// `;

// function addServerBlock(nginxPort, appPort) {
//     try {
//         // Read the existing nginx.conf file
//         let config = fs.readFileSync(NGINX_CONF_PATH, 'utf8');

//         // Generate the new server block with the given ports
//         const newServerBlock = TEMPLATE
//             .replace('{{port}}', nginxPort)
//             .replace('{{appPort}}', appPort);

//         // Find the position of the closing `}` of the `http` block and insert new server block before it
//         const httpClosingBracketIndex = config.lastIndexOf('}');

//         if (httpClosingBracketIndex === -1) {
//             console.error('❌ Error: Could not find closing bracket of the http block in nginx.conf.');
//             return;
//         }

//         // Insert new server block before the last `}`
//         config = config.slice(0, httpClosingBracketIndex) + newServerBlock + '\n' + config.slice(httpClosingBracketIndex);

//         // Write back the updated configuration
//         fs.writeFileSync(NGINX_CONF_PATH, config, 'utf8');

//         console.log(`✅ Server block added to nginx.conf (Port ${nginxPort} → App ${appPort})`);

//         // Reload Nginx to apply changes
//         exec(`${NGINX_CONF_PATH} -s reload`, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`❌ Error reloading Nginx: ${stderr}`);
//                 return;
//             }
//             console.log('✅ Nginx reloaded successfully');
//         });

//     } catch (error) {
//         console.error(`❌ Failed to update nginx.conf: ${error.message}`);
//     }
// }

// module.exports = { addServerBlock };
