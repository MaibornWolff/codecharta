---
title: "Sonar Importer"
description: "Import code metrics such as complexity, coverage and code smells from a SonarQube server into CodeCharta to find hotspots in your code."
---

The Sonar importer fetches the metrics of a project from a SonarQube server and writes them as a cc.json map. You
get every metric SonarQube computes, for every language it analyses, such as complexity, coverage, duplications and
code smells, on every file. Use it when your project already runs through SonarQube, or when you need a metric only
SonarQube provides.

## Before you start

You need a SonarQube server that has analysed your project, and a user token.

1. Start a server, for example locally with Docker:

   ```bash
   docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
   ```

   Open `http://localhost:9000` and log in with `admin` / `admin`. To install SonarQube from the zip file instead,
   follow the [SonarQube documentation](https://docs.sonarsource.com/sonarqube/latest/try-out-sonarqube/).
2. Create a project in SonarQube and analyse your code with the
   [SonarScanner](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/) as
   SonarQube's instructions describe. You need the project key from this step.
3. Create a **user token** under your account's security settings. Its value starts with `squ_`. Project and global
   analysis tokens can fail with an "Insufficient privileges" error, so the importer warns when the token does not look
   like a user token.

   ![SonarQube security settings with the form to generate a user token](/assets/images/docs/how-to/generate_user_token.png)

## Quick start

```bash
ccsh sonarimport http://localhost:9000 my-project-key -u squ_12345 -o sonar.cc.json
```

`URL` and `PROJECT_ID` are the `sonar.host.url` and `sonar.projectKey` your scanner uses.

## Options

| Option                           | Description                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `URL`                            | URL of the SonarQube server                                                                         |
| `PROJECT_ID`                     | key of the SonarQube project                                                                        |
| `-u, --user-token=<userToken>`   | user token to connect to the server                                                                 |
| `-m, --metrics=<metrics>`        | comma-separated list of SonarQube metric keys to import; all metrics when omitted                   |
| `--merge-modules`                | merge the modules of a multi-module project into one folder structure                              |
| `-o, --output-file=<outputFile>` | output file; prints to stdout when omitted                                                          |
| `-nc, --not-compressed`          | write plain JSON instead of a gzip file                                                             |
| `-h, --help`                     | show the help and exit                                                                              |

```text
Usage: ccsh sonarimport [-h] [--merge-modules] [-nc] [-o=<outputFile>]
                        [-u=<userToken>] [-m=<metrics>]... URL PROJECT_ID
```

In PowerShell, write the `--metrics` list without spaces or put it in quotes.

Import only a few metrics, from a multi-module project:

```bash
ccsh sonarimport https://sonar.example.com de.example:shop -u squ_12345 -m ncloc,complexity,coverage --merge-modules -o shop.cc.json
```

## Metrics

The importer takes every metric SonarQube reports for a file. See the
[SonarQube metric definitions](https://docs.sonarsource.com/sonarqube/latest/user-guide/code-metrics/metrics-definition/)
for the full list. Most metrics keep their SonarQube key with the prefix `sonar_`, for example `sonar_complexity` or
`sonar_code_smells`. These metrics get the CodeCharta name instead:

| SonarQube key              | CodeCharta metric      |
| -------------------------- | ---------------------- |
| `lines`                    | `loc`                  |
| `ncloc`                    | `rloc`                 |
| `comment_lines`            | `comment_lines`        |
| `commented_out_code_lines` | `commented_out_loc`    |
| `function_complexity`      | `average_function_mcc` |
| `functions`                | `functions`            |
| `statements`               | `statements`           |
| `accessors`                | `accessors`            |
| `public_api`               | `public_api`           |
| `line_coverage`            | `line_coverage`        |
| `branch_coverage`          | `branch_coverage`      |

`--metrics` takes the SonarQube keys, not the CodeCharta names. Each file links to its code page in SonarQube.

## Piped input

A project piped into `ccsh sonarimport` is merged with the SonarQube metrics:

```bash
ccsh unifiedparser . | ccsh sonarimport http://localhost:9000 my-project-key -u squ_12345 -o combined.cc.json
```

The merged map has an empty project name.

## Related

- [Analyze a project with SonarQube](/docs/analysis/example-sonar-qube): the full walkthrough from server to map
- [Merge Filter](/docs/filter/merge-filter): combine SonarQube metrics with other maps
- [Structure Modifier](/docs/filter/structure-modifier): rename an `mcc` metric to `sonar_complexity`
