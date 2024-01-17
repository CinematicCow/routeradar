/// Config code baby
use clap::ValueEnum;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::{fmt, path::PathBuf};

/// Represents the mode of operation.
#[derive(Debug, Clone, ValueEnum, Serialize, Deserialize, JsonSchema)]
pub enum Mode {
    /// For Nextjs mode.
    Next,
    /// For Sveltekit mode.
    Svelte,
}

/// Represents a route with its properties.
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Route {
    /// The path of the route.
    pub path: String,
    /// Children routes of the current route.
    pub children: Vec<Route>,
}

/// Represents a routing configuration.
#[derive(Serialize, Deserialize, JsonSchema)]
pub struct RR {
    /// The mode of operation.
    mode: Mode,
    /// The routes of the application.
    routes: Vec<Route>,
}

/// Enum representing kinds of errors in the module.
#[derive(Debug, Clone)]
pub enum ErrorKind {
    /// Indicates that the routing module encountered an invalid mode.
    InvalidMode,
    /// Indicates that the provided path is invalid.
    InvalidPath,
    /// Indicates that a dynamic route has an invalid configuration.
    InvalidDynamicRoute,
    /// Indicates that a catch-all route has an invalid configuration.
    InvalidCatchAllRoute,
    /// Indicates that a duplicate route has beed detected.
    DuplicateRoute,
    /// Indicates that a nested route is invalid.
    InvalidNestedRoute,
}

/// Struct representing an error in the routing module.
#[derive(Debug, Clone)]
pub struct Error {
    /// The specific kind of error.
    pub kind: ErrorKind,
    /// The path associated with the error, if applicable.
    pub path: Option<PathBuf>,
    /// A detailed error message.
    pub message: String,
}

impl Error {
    /// Initializes a new error.
    pub fn new(kind: ErrorKind, path: Option<PathBuf>, message: String) -> Self {
        Self {
            kind,
            path,
            message,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Error:{}", self.message)?;
        if let Some(path) = &self.path {
            write!(f, "\nat path: {}", path.display())?;
        }
        Ok(())
    }
}
