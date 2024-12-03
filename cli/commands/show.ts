import chalk from "chalk";
import { detectFramework } from "../../core/detect-framework";
import { scanRoutes } from "../../core/scan";
import { buildTree, printTree } from "../../core/tree";
import path from 'path';

/**
 * Displays the routes in a project.
 * 
 * @param projectPath - The path to the project directory.
 */
export const showRoutes = (projectPath: string) => {
  const framework = detectFramework(projectPath);
  if (!framework) {
    console.error(chalk.red('Unable to detect the framework. Make sure you\'re in a Next.js or SvelteKit project.'));
    return;
  }

  const pagesDir = framework === 'nextjs' ? 'pages' : 'src/routes';
  const routes = scanRoutes(path.join(projectPath, pagesDir), framework);
  const routeTree = buildTree(routes);

  console.log(chalk.blue(`Routes in your ${framework.toUpperCase()} project:`));
  printTree(routeTree);
}
