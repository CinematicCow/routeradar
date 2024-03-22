#![deny(missing_docs)]
//! routeradar is a cli tool intended to help with file based routing for nextjs and sveltejs

use std::path::PathBuf;

use routeradar::{
    config::{self, Mode},
    scanner,
};

mod cli;
use cli::*;

fn main() {
    // let schema = schemars::schema_for!(config::RR);
    // let schema_json = serde_json::to_string_pretty(&schema).unwrap();
    //
    // let mut file = File::create("routeradar_schema.json").unwrap();
    // file.write_all(schema_json.as_bytes()).unwrap();
    let Args {
        config,
        // mode,
        path,
        command,
    } = <Args as clap::Parser>::parse();
    let mut path2: PathBuf = Default::default();

    match command {
        Commands::Init => {
            let mode = Mode::get_mode(&path.unwrap());

            println!("{:?}", mode);

            if config.is_some() {
                path2 = config.unwrap();
            } else {
                match mode {
                    Ok(mode) => {
                        path2 = mode.get_root_path();
                    }
                    Err(error) => {
                        println!("{}", error)
                    }
                }
            }
            println!("{}", path2.display())
        }
        Commands::Add => todo!(),
        Commands::Show => {
            let mode = config::Mode::Svelte;

            let args_path = PathBuf::from(path.unwrap()).canonicalize().unwrap();
            // let relative_path = scanner::get_root_path(&mode);
            let relative_path = mode.get_root_path();

            let joined_path = args_path.join(&relative_path);

            let routes = scanner::generate_routes(&joined_path, mode.get_regex());
            match routes {
                Ok(data) => {
                    println!("{:#?}", data)
                }
                Err(err) => println!("{}", err),
            }
        }
        Commands::Gen => todo!(),
        Commands::Deb => {
            let mode = Mode::get_mode(&path.unwrap());

            match mode {
                Ok(mode) => {
                    println!("{:?}", mode);
                }
                Err(error) => {
                    println!("{}", error)
                }
            }
            // println!("{:?}", mode);
        }
    }
}
