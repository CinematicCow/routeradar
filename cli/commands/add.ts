import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { detectFramework } from '../../core/detect-framework';
import inquirer from 'inquirer';
import type { FrameworkConfig } from '../../types';

/**
 * Adds a new route to a project by creating a new directory and file for the route.
 * 
 * @param projectPath - The path to the project directory.
 * @param routePath - Optional path for the route if provided directly.
 */
export const addRoute = async (projectPath: string, routePath?: string) => {

  const framework = await detectFramework(projectPath)

  if (!framework) {
    console.error(
      chalk.red(
        "Unable to detect the framework. Make sure you are in a supported project."
      )
    )
    return
  }

  // if no route path is provided, ask the user
  if (!routePath) {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "routePath",
        message: "Enter the name or path for the new route:",
        validate: (input) => !!input || "Route name/path cannot be empty."
      },
      {
        type: "confirm",
        name: "includeLoad",
        message: "Do you want to include load functionality?",
        default: false
      },
      {
        type: "list",
        name: "fileType",
        message: "Chooose the file type:",
        choices: ["Typescript", "Javascript"],
        default: "Typescript"
      },
    ])

    routePath = answers.routePath
    const includeLoad = answers.includeLoad
    const isTS = answers.fileType === "Typescript"

    await createRoute(projectPath, routePath!, framework, includeLoad, isTS)
  } else {
    // Direct route creation
    await createRoute(projectPath, routePath!, framework, false, true)
  }
}

const createRoute = async (
  projectPath: string,
  routePath: string,
  framework: FrameworkConfig,
  includeLoad: boolean,
  isTypeScript: boolean
) => {
  const pagesDir = framework.pageDir;
  const pageFileBase = framework.pageFileName;
  const fullPath = path.join(projectPath, pagesDir, routePath);

  try {
    // Ensure directory exists
    fs.ensureDirSync(fullPath);

    // File extensions
    const pageFile = `${pageFileBase}.${isTypeScript ? "ts" : "js"}`;
    const loadFile = `${pageFileBase}.server.${isTypeScript ? "ts" : "js"}`;

    const pageFilePath = path.join(fullPath, pageFile);

    // Check for file existence
    if (fs.existsSync(pageFilePath)) {
      console.log(chalk.yellow(`Route ${routePath} already exists.`));
      return;
    }

    // Generate content
    const pageContent = framework.pageTemplate(isTypeScript);
    fs.writeFileSync(pageFilePath, pageContent);

    // Optionally add load functionality
    if (includeLoad) {
      const loadFilePath = path.join(fullPath, loadFile);
      const loadContent = framework.loadTemplate(isTypeScript);
      fs.writeFileSync(loadFilePath, loadContent);
    }

    console.log(chalk.green(`Route ${routePath} has been added successfully.`));
  } catch (error: any) {
    console.error(chalk.red(`Error adding route: ${error.message}`));
  }
}
