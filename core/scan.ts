import fs from 'fs-extra';
import path from 'path';
import { Framework, type FrameworkConfig } from '../types';
import { NEXTJS_PAGE_FILE, SVELTEKIT_PAGE_FILE } from '../utils/constant';
import type ignore from 'ignore';


/**
 * Recursively scans a directory for routes based on the provided framework.
 * 
 * @param dir - The directory to scan.
 * @param framework - The framework to scan for.
 * @param [basePath=''] - The base path to prepend to the routes.
 * @returns An array of routes found in the directory.
 */
export const scanRoutes = async (
  dir: string,
  framework: FrameworkConfig,
  basePath = "",
  ignoreFilter: ReturnType<typeof ignore> | null = null,
  memo: Set<string> = new Set()

): Promise<Array<string>> => {
  if (memo.has(dir)) {
    // skip already scanned dirs
    return []
  }
  memo.add(dir)

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const routes: Array<string> = []

    // parallel scan baby!
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(basePath, entry.name)

        // skip exclued paths
        if (ignoreFilter && ignoreFilter.ignores(relativePath)) {
          return
        }

        if (entry.isDirectory()) {
          // recursively scan dirs
          const subRoutes = await scanRoutes(fullPath, framework, relativePath, ignoreFilter, memo)
          routes.push(...subRoutes)
        } else if (entry.name === framework.pageFileName) {
          routes.push(basePath)
        }
      })
    )
    return routes
  } catch (error) {
    console.error(`Error scanning directory ${dir}: `, error)
    return []
  }
}
