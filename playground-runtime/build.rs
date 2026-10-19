//! Records the MatchBox version the runtime is built from, so the page can show it.
use std::{env, fs, path::PathBuf};

fn main() {
    let manifest = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../../matchbox/Cargo.toml");
    println!("cargo:rerun-if-changed={}", manifest.display());
    let text = fs::read_to_string(&manifest).expect("sibling ../matchbox/Cargo.toml (the MatchBox checkout) is required");
    let version = text
        .split("[package]")
        .nth(1)
        .and_then(|package| package.lines().find(|line| line.trim_start().starts_with("version")))
        .and_then(|line| line.split('"').nth(1))
        .expect("MatchBox version not found in ../matchbox/Cargo.toml");
    println!("cargo:rustc-env=MATCHBOX_VERSION={version}");
}
