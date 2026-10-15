# Quality Gate

`ccsh gate` analyses a project with the applicable parsers, merges their maps and checks the result against the
metric and dependency-cycle rules in the project's `.codecharta.yml`. It prints every broken rule, writes the merged
map and a JSON report into its output folder and exits with the code the config maps the worst finding to.

Full documentation: https://maibornwolff.github.io/codecharta/docs/analysis/quality-gate

### Usage and Parameters

| Command / Parameter    | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| `ccsh gate [FOLDER]`   | analyses the project and checks it against the config                       |
| `ccsh gate init`       | analyses the project and writes a fully commented-out `.codecharta.yml`     |
| `ccsh gate doctor`     | validates the config without analysing                                      |
| `FOLDER`               | project folder (default: the current folder)                                |
| `-c, --config=<file>`  | config file (default: `.codecharta.yml` in the project folder)              |
| `-f, --force`          | `init` only: overwrites an existing config                                  |
| `-h, --help`           | displays help and exits                                                     |

```
Usage: ccsh gate [-h] [-c=<configFile>] [FOLDER] [COMMAND]
```

## Examples

```
ccsh gate init
ccsh gate doctor
ccsh gate path/to/project --config=ci/codecharta.yml
```

Exit codes: 0 when no rule is broken, the code `exitCodes` maps a found severity to (default `error: 1`,
`warning: 0`), and 2 when the gate itself fails.
