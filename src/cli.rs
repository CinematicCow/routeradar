use crate::config;
use clap::{Parser, Subcommand};
use std::path::PathBuf;
#[derive(Debug, Parser)]
#[command(author, version, about, long_about=None, arg_required_else_help=true)]
pub(super) struct Args {
    /// set custom config file
    #[arg(short, long, value_name = "FILE")]
    pub(super) config: Option<PathBuf>,

    /// set operation mode
    #[arg(short, long, value_name = "MODE")]
    pub(super) mode: Option<config::Mode>,

    /// set path manually
    #[arg(short, long, value_name = "PATH")]
    pub(super) path: Option<PathBuf>,

    #[command(subcommand)]
    pub(super) command: Commands,
}

#[derive(Debug, Subcommand)]
pub(super) enum Commands {
    /// initializes routeradar
    Init,
    /// add a new route
    Add,
    /// displays all the routes in the project
    Show,
    /// generates routes from a config file
    Gen,
    /// temp command for debug
    Deb,
}
