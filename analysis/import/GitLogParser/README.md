# GitLogParser

Generates visualization data from git repository logs and repository file list.

This parser specializes in tracking file changes across different file-versions on different feature-branches and then
the merged main.
Furthermore, special care is taken not to display non-existent files that might show up in normal Git histories due to
renaming actions on feature branches.

Things to note:

-   File deletions that get reverted later on are ignored by this parser.

It supports the following metrics per file:

| Metric                          | Description                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `age_in_weeks`                  | age of the file in weeks                                                              |
| `number_of_authors`             | number of authors with commits                                                        |
| `number_of_commits`             | total number of commits                                                               |
| `number_of_renames`             | total number of renames                                                               |
| `range_of_weeks_with_commits`   | week Range of Commits                                                                 |
| `successive_weeks_with_commits` | successive Weeks with Commits                                                         |
| `weeks_with_commits`            | weeks with commits                                                                    |
| `highly_coupled_files`          | Number of highly coupled files (>=35% of times modified the same time) with this file |
| `median_coupled_files`          | Median of number of other files that where committed with this file                   |

Additionally, the following Edge Metrics are calculated:

| Metric              | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `temporal_coupling` | The degree of temporal coupling between two files (>=35%) |

The names of authors are saved when the --add-author flag is set.

## Scan a local git repository on your machine

### Creating required files on the fly | repo-scan

See `ccsh gitlogparser repo-scan -h` for help. Standard usage:

> `ccsh gitlogparser repo-scan --repo-path <path>`

With the sub command `repo-scan` you can parse a local git repository on your disk. During scanning a git log of the
repository in the current working directory (or from the directory specified by repo-path) is created in your
temp-Folder and parsed automatically. Furthermore, the parser creates another temporary file-name-list of files that are
tracked by git automatically which is needed for the parsing process.

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the GitLogParser, the results and the piped project are merged.
The resulting project has the project name specified for the GitLogParser.

#### Executing the repo-scan subcommand

-   `ccsh gitlogparser repo-scan --repo-path <path_to_my_git_project> -o output.cc.json.gz`
-   load `output.cc.json.gz` in visualization

### Manual creation of required files | log-scan

See `ccsh gitlogparser log-scan -h` for help. Standard usage:

> `ccsh gitlogparser log-scan --git-log <path> --repo-files <path>`

With the sub command `log-scan`, an existing git log and file name list are used for parsing.

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the GitLogParser, the results and the piped project are merged.
The resulting project has the project name specified for the GitLogParser.

#### Creating the repository log for metric generation

| SCM | Log format                   | Command for log creation                            | tracks renames | ignores deleted files | supports code churn |
| --- | ---------------------------- | --------------------------------------------------- | -------------- | --------------------- | ------------------- |
| git | GIT_LOG_NUMSTAT_RAW_REVERSED | `git log --numstat --raw --topo-order --reverse -m` | yes            | yes                   | yes                 |

You can also use the bash
script [anongit](https://github.com/MaibornWolff/codecharta/blob/main/analysis/import/GitLogParser/src/main/dist/anongit)
which generates a git log with anonymized authors for usage with CodeCharta.

#### Creating the git files list of the repository for metric generation

> `git ls-files > file-name-list.txt`

Please make sure to execute this command in the root folder of your repository.

#### Executing the log-scan subcommand

-   `cd <my_git_project>`
-   `git log --numstat --raw --topo-order --reverse -m > git.log` (or `anongit > git.log`)
-   `git ls-files > file-name-list.txt`
-   `ccsh gitlogparser log-scan --git-log git.log --repo-files file-name-list.txt -o output.cc.json.gz`
-   load `output.cc.json.gz` in visualization
