# Quality Gate

> **Experimental:** the commands, the config format and the report of the gate may still change between releases.

`ccsh gate` analyses a project with the applicable parsers, merges their maps and checks the result against the
metric and dependency rules in the project's `.codecharta.yml`. It prints every broken rule, writes the merged
map and a JSON report into its output folder and exits with the code the config maps the worst finding to.

Full documentation: https://maibornwolff.github.io/codecharta/docs/analysis/quality-gate

### Usage and Parameters

| Parameter              | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| `FOLDER`               | project folder (default: the current folder)                                |
| `--init`               | analyses the project and writes a `.codecharta.yml` with its rules commented out |
| `--doctor`             | validates the config without analysing                                      |
| `-c, --config=<file>`  | config file (default: `.codecharta.yml` in the project folder)              |
| `-f, --force`          | lets `--init` overwrite an existing config                                  |
| `-m, --map=<file>`     | checks this cc.json map instead of analysing the project                    |
| `-p, --parallel`       | runs the analysers at the same time (also `parallel: on` in the config)     |
| `-q, --quiet`          | keeps the output of the analysers off the console                           |
| `-h, --help`           | displays help and exits                                                     |

Without `--init` or `--doctor`, the gate analyses the project and checks it against the config. Called without
arguments in a terminal, it starts right away when the current folder has a `.codecharta.yml`, and asks what to do
otherwise.

```
Usage: ccsh gate [-fhpq] [--doctor] [--init] [-c=<configFile>] [-m=<mapFile>] [FOLDER]
```

## Examples

```
ccsh gate --init
ccsh gate --doctor
ccsh gate path/to/project --config=ci/codecharta.yml
ccsh gate --map=build/project.cc.json.gz
```

Exit codes: 0 when no rule is broken, the code `exitCodes` maps the worst severity found to (default `error: 1`,
`warning: 0`), and 2 when the gate itself fails.
