import fs from 'fs-extra';
import path from 'path';
import type { Framework } from '../types';


const NEXTJS_PAGE_FILE = 'index.js';
const SVELTEKIT_PAGE_FILE = '+page.svelte';

/**
 * Recursively scans a directory for routes based on the provided framework.
 * 
 * @param dir - The directory to scan.
 * @param framework - The framework to scan for.
 * @param [basePath=''] - The base path to prepend to the routes.
 * @returns An array of routes found in the directory.
 */
export const scanRoutes = (dir: string, framework: Framework, basePath = ''): Array<string> => {
  const routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      routes.push(...scanRoutes(fullPath, framework, relativePath));
    } else if (
      (framework === 'nextjs' && entry.name === NEXTJS_PAGE_FILE) ||
      (framework === 'sveltekit' && entry.name === SVELTEKIT_PAGE_FILE)
    ) {
      routes.push(basePath);
    }
  }

  return routes;
}
