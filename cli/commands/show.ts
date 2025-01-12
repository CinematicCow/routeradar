import chalk from "chalk";
import { detectFramework } from "../../core/detect-framework";
import { scanRoutes } from "../../core/scan";
import { buildTree, printTree } from "../../core/tree";
import path from 'path';
import { getIgnoreFilter } from "../../utils/helper";

/**
 * Displays the routes in a project.
 * 
 * @param projectPath - The path to the project directory.
 */
export const showRoutes = async (projectPath: string) => {
  const framework = await detectFramework(projectPath);
  if (!framework) {
    console.error(chalk.red('Unable to detect the framework. Make sure you\'re in a supported framework.'));
    return;
  }

  const ignoreFilter = await getIgnoreFilter(projectPath)
  const routes = await scanRoutes(path.join(projectPath, framework.pageDir), framework, "", ignoreFilter);

  const routeTree = buildTree(routes);
  console.log(chalk.blue(`Routes in your ${framework.name.toUpperCase()} project:`));
  printTree(routeTree);
}
