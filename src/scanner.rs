use std::path::PathBuf;

use regex::Regex;
use walkdir::{DirEntry, WalkDir};

use crate::config::{Error, ErrorKind, Mode};

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

/// Generate all routes
/// Recursively scan the given path and generate routes based on the folder structure.
// pub fn generate_routes(path: &PathBuf) -> Result<Vec<Route>, Error> {
//     let mut routes: HashMap<String, Route> = HashMap::new();

//     generate_routes_helper(path, &mut routes)?;

//     // Convert the HashMap into a vector of routes
//     let routes: Vec<Route> = routes.values().cloned().collect();

//     // Group the children together
//     let mut grouped_routes: Vec<Route> = Vec::new();
//     for route in routes {
//         if route.path == "+page.svelte" {
//             continue;
//         }

//         let mut parent_route = None;
//         for grouped_route in &mut grouped_routes {
//             if grouped_route.path == route.path {
//                 parent_route = Some(grouped_route);
//                 break;
//             }
//         }

//         if let Some(parent_route) = parent_route {
//             parent_route.children.push(route);
//         } else {
//             grouped_routes.push(route);
//         }
//     }

//     Ok(grouped_routes)
// }

pub fn generate_routes(path: &PathBuf, re: Regex) -> Result<Vec<String>, Error> {
    let mut routes = Vec::new();

    // Walk through the directory using walkdir
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| re.is_match(&e.file_name().to_str().expect("File name should be utf8")))
        .for_each(|entry: DirEntry| {
            let dir_entry = entry.path();

            // Add the path to the vec
            routes.push(dir_entry.to_string_lossy().to_string())
        });

    return Ok(routes);
}

impl Mode {
    /// Gets the regex to match for route generation.
    pub fn get_regex(&self) -> Regex {
        match self {
            Self::Svelte => Regex::new(r"\+page\.svelte").unwrap(),
            Self::Next => todo!(),
        }
    }

    /// Gets the mode to operate on by traversing the files of the given path.
    pub fn get_mode(path: &PathBuf) -> Result<Self, Error> {
        for entry in WalkDir::new(path)
            .into_iter()
            .filter_entry(|e| !is_ignored(e))
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
        {
            let file = entry.file_name();

            if file == "next.config.js" {
                return Ok(Self::Next);
            } else if file == "svelte.config.js" {
                return Ok(Self::Svelte);
            }
        }
        Err(Error::new(
            ErrorKind::InvalidPath,
            Some(path.canonicalize().expect("canonicalize path")),
            "Invalid path provided.".to_string(),
        ))
    }

    /// Get the default root route path for a mode
    pub fn get_root_path(&self) -> PathBuf {
        match self {
            Self::Next => return PathBuf::from("app/"),
            Self::Svelte => return PathBuf::from("src/routes/"),
        }
    }
}
