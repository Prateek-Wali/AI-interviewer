const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// Add any other folders you want to scan here (e.g., 'lib', 'hooks', 'types')
const foldersToInclude = ['app', 'components', 'utils', 'lib', 'hooks'];

// We skip these file types to keep the file size small and text-only
const ignoredExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.mp4']; 
const outputFile = 'codebase_context.txt';
// ---------------------

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles || [];
  
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      // Only include files that are NOT in the ignored list
      if (!ignoredExtensions.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

let content = "Project Codebase Context:\n\n";

// 1. Add specific root files that are important for configuration
const rootFiles = ['middleware.ts', 'next.config.js', 'package.json', 'tsconfig.json'];
rootFiles.forEach(file => {
    if(fs.existsSync(file)) {
        content += `\n================================================================================\n`;
        content += `FILE PATH: ${file}\n`;
        content += `================================================================================\n`;
        content += fs.readFileSync(file, 'utf8');
        content += `\n\n`;
    }
});

// 2. Add files from the directories
foldersToInclude.forEach(dir => {
    const fullFiles = getAllFiles(dir);
    fullFiles.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf8');
        content += `\n================================================================================\n`;
        content += `FILE PATH: ${file}\n`;
        content += `================================================================================\n`;
        content += fileContent;
        content += `\n\n`;
    });
});

fs.writeFileSync(outputFile, content);
console.log(`✅ Success! Created ${outputFile}`);
console.log(`Please upload '${outputFile}' to the AI chat.`);