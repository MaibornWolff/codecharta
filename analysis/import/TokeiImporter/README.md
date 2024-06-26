# Tokei Importer

[Tokei](https://github.com/XAMPPRocky/tokei) is a program that computes basic metrics for your code.
It supports a large amount
of [different languages](https://github.com/XAMPPRocky/tokei?tab=readme-ov-file#supported-languages). The metrics
provided are:

- Lines
- Lines of Code
- Lines of comments
- Blank lines

The TokeiImporter lets you import json files generated by Tokei into CodeCharta.

## Install Tokei

There are several ways to [install Tokei](https://github.com/XAMPPRocky/tokei#installation).

On the release posts you can download binaries for **Linux** and **MacOs** as well as executables for **Windows**.

If you want to build it yourself, check the repository directly or this guide:

1. Make sure you have [Rust](https://www.rust-lang.org/tools/install)
   and the C++ Build Tools of Visual Studio installed.
2. Build Tokei from source
   ```
   $ git clone https://github.com/XAMPPRocky/tokei.git
   $ cd tokei
   $ cargo build --release
   ```
3. Install tokei with enabled json support `cargo install tokei --features json`
4. Add tokei to your PATH variable if necessary

## Analyze a Project with Tokei

Run

```bash
tokei . --output json > tokei_results.json
```

in the project's root folder.

## Usage of the Tokei Importer

| Parameter                          | description                                                                |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `<FILE>`                           | Tokei generated JSON file                                                  |
| `-h, --help`                       | displays this help and exits                                               |
| `-o, --output-file=<outputFile>`   | output File (or empty for stdout)                                          |
| `-r, --root-name=<rootName>`       | root folder as specified when executing tokei                              |
| `--path-separator=<pathSeparator>` | path separator, leave empty for auto-detection UNIX/Windows (default = '') |
| `-nc, --not-compressed`            | don't compress output to gzip, output JSON instead                         |

```
Usage: ccsh tokeiimporter [-h] [--path-separator=<pathSeparator>]
                          [-o=<outputFile>] [-r=<rootName>] [-nc]
                          [FILE]
```

Examples:

```
ccsh tokeiimporter tokei_results.json --path-separator=\\ -o output.cc.json
```

> You can also pipe directly

```
tokei yourCode -o json | ccsh tokeiimporter -r yourCode
```
