import path from 'path';
import fs from 'fs-extra';
import { Framework } from '../types';

/**
 * Detects the framework used in a project based on the presence of specific configuration files.
 * 
 * @param projectPath - The path to the project directory.
 * @returns The detected framework, or None if no framework is deteced.
 */
export const detectFramework = (projectPath: string): Framework => {
  if (fs.existsSync(path.join(projectPath, 'svelte.config.js'))) {
    return Framework.SVELTEKIT;
  } else if (fs.existsSync(path.join(projectPath, 'next.config.js'))) {
    return Framework.NEXTJS;
  }
  return Framework.None;
}
