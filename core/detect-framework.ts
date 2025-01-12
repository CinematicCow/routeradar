import path from 'path';
import fs from 'fs-extra';
import { type FrameworkConfig } from '../types';
import { FRAMEWORKS } from '../utils/constant';

/**
 * Detects the framework used in a project based on the presence of specific configuration files.
 * 
 * @param projectPath - The path to the project directory.
 * @returns The detected framework, or None if no framework is deteced.
 */
export const detectFramework = async (projectPath: string): Promise<FrameworkConfig | null> => {
  for (const framework of FRAMEWORKS) {
    const filePath = path.join(projectPath, framework.detectFile)
    try {
      await fs.access(filePath)
      return framework
    } catch (error) {
      continue
    }
  }
  return null
}
