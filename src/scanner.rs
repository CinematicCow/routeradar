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
    // Collect all the paths
    let mut routes: Vec<String> = Vec::new();
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if entry.path().is_file() && entry.path().file_name().unwrap() == "+page.svelte" {
            // Calculate relative path from base path
            let relative_path = entry
                .path()
                .strip_prefix(path)
                .unwrap()
                .to_string_lossy()
                .into_owned();

            routes.push(relative_path);
        }
    }

    // Construct the route tree
    let mut root: Route = Route {
        path: String::from("/"),
        children: Vec::new(),
    };
    for route in routes {
        add_route_to_tree(&mut root, &route);
    }

    Ok(vec![root])
}

fn add_route_to_tree(root: &mut Route, path: &String) {
    // Split the path into components
    let segments: Vec<&str> = path.split('/').collect();

    // Iterate over the segments and add them as children
    let mut curr = root;
    for segment in segments {
        if segment.is_empty() {
            continue;
        }
        let mut found = false;
        for child in &mut curr.children {
            if child.path == segment {
                curr = child;
                found = true;
                break;
            }
        }
        if !found {
            let new_child = Route {
                path: segment.to_string(),
                children: Vec::new(),
            };
            curr.children.push(new_child);
            curr = &mut curr.children[curr.children.len() - 1];
        }
    }
}
