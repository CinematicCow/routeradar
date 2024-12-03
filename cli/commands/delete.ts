import chalk from "chalk";
import { detectFramework } from "../../core/detect-framework";
import path from 'path';
import fs from 'fs-extra';
import { scanRoutes } from "../../core/scan";
import { getChildRoutes } from "../../core/tree";
import inquirer from 'inquirer';

/**
 * Deletes a route and its child routes from a project.
 * 
 * @param projectPath - The path to the project.
 * @param routePath - The path to the route to delete.
 */
export const deleteRoute = async (projectPath: string, routePath: string): Promise<void> => {
  const framework = detectFramework(projectPath);
  if (!framework) {
    console.error(chalk.red('Unable to detect the framework. Make sure you\'re in a Next.js or SvelteKit project.'));
    return;
  }

  const pagesDir = framework === 'nextjs' ? 'pages' : 'src/routes';
  const fullPath = path.join(projectPath, pagesDir, routePath);

  if (!fs.existsSync(fullPath)) {
    console.error(chalk.red(`Route ${routePath} does not exist.`));
    return;
  }

  const routes = scanRoutes(path.join(projectPath, pagesDir), framework);
  const childRoutes = getChildRoutes(routes, routePath);

  console.log(chalk.yellow('The following routes will be deleted:'));
  console.log(chalk.cyan(routePath));
  childRoutes.forEach(route => console.log(chalk.cyan(route)));

  console.log(chalk.red('\nWARNING: This action cannot be undone!'));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete these routes?',
      default: false,
    },
  ]);

  if (confirm) {
    try {
      fs.removeSync(fullPath);
      console.log(chalk.green(`Route ${routePath} and its child routes have been deleted successfully.`));
    } catch (error: any) {
      console.error(chalk.red(`Error deleting route: ${error.message}`));
    }
  } else {
    console.log(chalk.blue('Deletion cancelled.'));
  }
}
