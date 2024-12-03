import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { detectFramework } from '../../core/detect-framework';
import { NEXTJS_PAGE_FILE, SVELTEKIT_PAGE_FILE } from '../../utils/constant';

/**
 * Adds a new route to a project by creating a new directory and file for the route.
 * 
 * @param projectPath - The path to the project directory.
 * @param routePath - The path to the new route.
 */
export const addRoute = (projectPath: string, routePath: string) => {
  const framework = detectFramework(projectPath);
  if (!framework) {
    console.error(chalk.red('Unable to detect the framework. Make sure you\'re in a Next.js or SvelteKit project.'));
    return;
  }

  const pagesDir = framework === 'nextjs' ? 'pages' : 'src/routes';
  const pageFile = framework === 'nextjs' ? NEXTJS_PAGE_FILE : SVELTEKIT_PAGE_FILE;
  const fullPath = path.join(projectPath, pagesDir, routePath);

  try {
    fs.ensureDirSync(fullPath);
    const filePath = path.join(fullPath, pageFile);

    if (fs.existsSync(filePath)) {
      console.log(chalk.yellow(`Route ${routePath} already exists.`));
    } else {
      let content = '';
      if (framework === 'nextjs') {
        content = `
import React from 'react';

export default function Page() {
  return (
    <h1>Black magic habibi</h1>
  );
}
`;
      } else if (framework === 'sveltekit') {
        content = `
<h1>Black magic habibi</h1>
`;
      }

      fs.writeFileSync(filePath, content);
      console.log(chalk.green(`Route ${routePath} has been added successfully.`));
    }
  } catch (error:any) {
    console.error(chalk.red(`Error adding route: ${error.message}`));
  }
}
