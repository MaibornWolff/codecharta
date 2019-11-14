---
permalink: /docs/importers/
title: "Importers"

toc: true
toc_label: "Jump to Section"
---

The CodeCharta Shell (ccsh) is a convenient way to access the various tools. They in turn are divided into importers, mappers and exporters.

- Importers take a source like Sonar and return a `.cc.json`
- Mappers take a `.cc.json` and return a `.cc.json`
- Exporters take a `.cc.json` and return the target form

If you want to combine multiple metrics into one `.cc.json` you should get comfortable with the [merge mapper](#merge). Some importers support direct pipe-through, which means you don't have to use the merge mapper.

[Custom Metics and Importer]({{site.baseurl}}{% link _docs/05-04-custom-metrics.md %})

# Importers

## ScmlogParser

Generates visualisation data from repository (Git or SVN) logs.

### Usage

> `ccsh scmlogparser <log_file> --input-format [GIT_LOG|GIT_LOG_NUMSTAT|GIT_LOG_NUMSTAT_RAW|GIT_LOG_RAW|SVN_LOG]`

Pipe-Support: YES

### Git example

```bash
# Download any Git project, for example Git itself
git clone https://github.com/git/git.git
# Generate a <project>.git.log
cd netbeans; git log --numstat --raw --topo-order > ../junit4.git.log; cd ..
# depending on how big the log is you might want to add --after=YYYY-MM-DD
```

### Svn example

```bash
# Download any Svn Project, for example Subversion itself
svn co https://svn.apache.org/repos/asf/subversion/trunk subversion
# Generate a <project>.svn.log (might take a while)
cd subversion; svn log --verbose > ../subversion.svn.log; cd ..
# Generate cc.json
ccsh scmlogparser subversion.svn.log --input-format SVN_LOG -o subversion.svn.cc.json
```

### Metrics

The supported metrics are:

| Metric                 | Description                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `age_in_weeks`         | age of the file in weeks                                                              |
| `number_of_commits`    | total number of commits                                                               |
| `highly_coupled_files` | Number of highly coupled files (>=35% of times modified the same time) with this file |
| `median_coupled_files` | Median of number of other files that where commited with this file                    |
| `number_of_renames`    | total number of renames                                                               |
| `weeks_with_commits`   | weeks with commits                                                                    |
| `number_of_authors`    | number of authors with commits                                                        |
| `code_churn`           | code churn, i.e. number of additions plus deletions to file                           |

Additionally it saves the names of authors when the `--add-author` flag is set.

### Log Format

| SCM | Log format          | Command for log creation               | tracks renames | ignores deleted files | supports code churn |
| --- | ------------------- | -------------------------------------- | -------------- | --------------------- | ------------------- |
| git | GIT_LOG             | `git log --name-status --topo-order`   | yes            | yes                   | no                  |
| git | GIT_LOG_NUMSTAT     | `git log --numstat --topo-order`       | yes            | no                    | yes                 |
| git | GIT_LOG_NUMSTAT_RAW | `git log --numstat --raw --topo-order` | yes            | yes                   | yes                 |
| git | GIT_LOG_RAW         | `git log --raw --topo-order`           | yes            | yes                   | no                  |
| SVN | SVN_LOG             | `svn log --verbose`                    | yes            | yes                   | no                  |

# Mappers

## Merge

# Exporters

## asdf
