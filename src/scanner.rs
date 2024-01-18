use std::{collections::HashMap, path::PathBuf};

use walkdir::{DirEntry, WalkDir};

use crate::config::{Error, ErrorKind, Mode, Route};

fn is_ignored(entry: &DirEntry) -> bool {
    let path = entry.path();
    let file_name = path.file_name();
    match file_name {
        Some(file_name) => {
            let file_name = file_name.to_str().unwrap();
            ["node_modules", ".git", "target", ".svelte-kit"].contains(&file_name)
        }
        None => false,
    }
}

/// Gets the mode to operate on by traversing the files of the given path.
pub fn get_mode(path: &PathBuf) -> anyhow::Result<Mode, Error> {
    for entry in WalkDir::new(path)
        .into_iter()
        .filter_entry(|e| !is_ignored(e))
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_file())
    {
        let file = entry.file_name();

        if file == "next.config.js" {
            return Ok(Mode::Next);
        } else if file == "svelte.config.js" {
            return Ok(Mode::Svelte);
        }
    }
    Err(Error::new(
        ErrorKind::InvalidPath,
        Some(path.canonicalize().expect("canonicalize path")),
        "Invalid path provided.".to_string(),
    ))
}
/// Get the default root route path for a mode
pub fn get_root_path(mode: &Mode) -> PathBuf {
    match mode {
        Mode::Next => return PathBuf::from("app/"),
        Mode::Svelte => return PathBuf::from("src/routes/"),
    }
}

/// Generate all routes
/// Recursively scan the given path and generate routes based on the folder structure.
pub fn generate_routes(path: &PathBuf) -> Result<Vec<Route>, Error> {
    let mut routes: HashMap<String, Route> = HashMap::new();

    generate_routes_helper(path, &mut routes)?;

    // Convert the HashMap into a vector of routes
    let routes: Vec<Route> = routes.values().cloned().collect();

    // Group the children together
    let mut grouped_routes: Vec<Route> = Vec::new();
    for route in routes {
        if route.path == "+page.svelte" {
            continue;
        }

        let mut parent_route = None;
        for grouped_route in &mut grouped_routes {
            if grouped_route.path == route.path {
                parent_route = Some(grouped_route);
                break;
            }
        }

        if let Some(parent_route) = parent_route {
            parent_route.children.push(route);
        } else {
            grouped_routes.push(route);
        }
    }

    Ok(grouped_routes)
}

fn generate_routes_helper(
    path: &PathBuf,
    routes: &mut HashMap<String, Route>,
) -> Result<(), Error> {
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if entry.path().is_file() && entry.path().file_name().unwrap() == "+page.svelte" {
            // Calculate relative path from base path
            let relative_path = entry
                .path()
                .strip_prefix(path)
                .unwrap()
                .to_string_lossy()
                .into_owned();

            // Split the relative path into its components
            let path_components: Vec<&str> = relative_path.split("/").collect();

            // Get the parent route's path
            let parent_path = path_components[0..path_components.len() - 1].join("/");

            // Check if the parent route exists
            let mut parent_route = routes.get_mut(&parent_path);

            // If the parent route exists, add the child route to its children
            if let Some(ref mut parent_route) = parent_route {
                parent_route.children.push(Route {
                    path: relative_path.clone(), // Use the full relative path as the route's path
                    children: Vec::new(),
                });
            } else {
                // If the parent route does not exist, create a new one and insert it into the HashMap
                let mut parent_route = Route {
                    path: parent_path.clone(),
                    children: Vec::new(),
                };
                routes.insert(parent_path.clone(), parent_route.clone());

                // Add the child route to the parent route's children
                parent_route.children.push(Route {
                    path: relative_path.clone(), // Use the full relative path as the route's path
                    children: Vec::new(),
                });
            }

            // Check if the current route is a child route
            if path_components.len() > 1 {
                // Get the child route's path
                let child_path = path_components[path_components.len() - 1];

                // Check if the child route already exists
                let child_route = routes.get_mut(&relative_path);

                // If the child route exists, add it to the parent route's children
                if let Some(child_route) = child_route {
                    parent_route.unwrap().children.push(child_route.clone());
                } else {
                    // If the child route does not exist, create a new one and insert it into the HashMap
                    let child_route = Route {
                        path: relative_path.clone(), // Use the full relative path as the route's path
                        children: Vec::new(),
                    };
                    routes.insert(relative_path.clone(), child_route.clone());

                    // Add the child route to the parent route's children
                    parent_route.unwrap().children.push(child_route);
                }
            }
        }
    }

    Ok(())
}
