import chalk from 'chalk';
import type { TreeRoot } from "../types";

/**
 * Builds a tree data structure from a list of routes.
 * 
 * @param routes - The list of routes to build the tree from.
 * @returns The root node of the route tree.
 */
export const buildTree = (routes: Array<string>): TreeRoot => {
  const root: TreeRoot = { name: '/', children: [] };

  for (const route of routes) {
    const parts = route.split('/').filter(Boolean);
    let currentNode = root;

    for (const part of parts) {
      let child = currentNode.children.find(c => c.name === part);
      if (!child) {
        child = { name: part, children: [] };
        currentNode.children.push(child);
      }
      currentNode = child;
    }
  }

  return root;
}


/**
 * Prints a route tree to the console.
 * 
 * @param node - The current node in the route tree.
 * @param prefix - The prefix to use when printing the node.
 * @param isLast - Whether the current node is the last child of its parent.
 */
export const printTree = (node: TreeRoot, prefix = '', isLast = true): void => {
  const marker = isLast ? '└── ' : '├── ';
  console.log(chalk.cyan(`${prefix}${marker}${node.name}`));

  const childPrefix = prefix + (isLast ? '    ' : '│   ');
  const lastIndex = node.children.length - 1;

  node.children.forEach((child, index) => {
    printTree(child, childPrefix, index === lastIndex);
  });
}


/**
 * Filters child routes from a list of routes based on a parent route.
 * 
 * @param routes - An array of route strings.
 * @param parentRoute - The parent route to filter by.
 * @returns An array of child routes.
 */
export const getChildRoutes = (routes: Array<string>, parentRoute: string): Array<string> => {
  return routes.filter(route => route.startsWith(parentRoute) && route !== parentRoute);
}
