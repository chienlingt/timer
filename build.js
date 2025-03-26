// build.js
import { exec } from 'child_process';
import fs from 'fs';

// Run Vite build
exec('vite build', (error) => {
  if (error) {
    console.error(`Error during Vite build: ${error}`);
    return;
  }
  
  // Create electron folder in dist
  if (!fs.existsSync('./dist/electron')) {
    fs.mkdirSync('./dist/electron', { recursive: true });
  }
  
  // Copy electron files
  fs.copyFileSync('./electron/main.js', './dist/electron/main.js');
  
  // Update package.json for distribution
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const distPkg = {
    name: pkg.name,
    version: pkg.version,
    description: "QB Debating Timer Application",
    author: "Timer Developer",
    main: "electron/main.js", // Point to the copied main.js file
    dependencies: pkg.dependencies
  };
  
  fs.writeFileSync('./dist/package.json', JSON.stringify(distPkg, null, 2));
  
  console.log('Files prepared for electron-builder');
  
  // Run electron-builder
  exec('electron-builder -w', (err) => {
    if (err) {
      console.error(`Error during electron-builder: ${err}`);
      return;
    }
    console.log('Build completed successfully');
  });
});