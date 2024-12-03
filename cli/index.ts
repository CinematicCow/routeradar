#!/usr/bin/env node
import { program } from 'commander';
import { showRoutes } from './commands/show';
import { addRoute } from './commands/add';
import { deleteRoute } from './commands/delete';

program
  .version('1.0.0')
  .description('CLI tool to scan and manage routes in Next.js and SvelteKit projects');

program
  .command('show')
  .description('Display all routes in the project')
  .action(() => showRoutes(process.cwd()));

program
  .command('add <route>')
  .description('Add a new route to the project')
  .action((route) => addRoute(process.cwd(), route));

program
  .command('rm <route>')
  .description('Delete a route and its child routes from the project')
  .action((route) => deleteRoute(process.cwd(), route));

program.parse(process.argv);
