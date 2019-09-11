# Tokei Importer

## Install Tokei

1. Make sure you have [Rust](https://www.rust-lang.org/tools/install) installed.
   (On Windows the C++ Build Tools of Visual Studio are required too)
2. Build tokei from source
   ```
   $ git clone https://github.com/XAMPPRocky/tokei.git
   $ cd tokei
   $ cargo build --release
   ```
3. Install tokei with enabled json support `cargo install tokei --features json`
4. Add tokei to your PATH variable if necessary

## Analyze Project with tokei

Run `tokei . --output json > tokei_results.json` in the project's root folder.
