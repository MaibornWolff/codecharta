---
permalink: /docs/sonar-importer
title: "Sonar Importer"
---

The Sonar-Importer generates visualisation data from SonarQube data through an API call to a SonarQube server.

## Usage and Parameters

| Parameter                        | description                                                                                                                                                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`                            | url of sonarqube server                                                                                                                                                                                                                              |
| `PROJECT_ID`                     | sonarqube project id                                                                                                                                                                                                                                 |
| `-h, --help`                     | Please locate:<br/> - sonar.host.url=https://sonar.foo<br/> - sonar.login=c123d456<br/> - sonar.projectKey=de.foo:bar<br/> That you use to upload your code to sonar.<br/> Then execute [sonarimport https://sonar.foo de.foo:<br/> bar -u c123d456] |
| `-m, --metrics=<metrics>`        | comma-separated list of metrics to import                                                                                                                                                                                                            |
| `--merge-modules`                | merges modules in multi-module projects                                                                                                                                                                                                              |
| `-nc, --not-compressed`          | save uncompressed output File                                                                                                                                                                                                                        |
| `-o, --output-file=<outputFile>` | output File                                                                                                                                                                                                                                          |
| `-u, --user=<user>`              | user token for connecting to remote sonar instance                                                                                                                                                                                                   |

```
Usage: ccsh sonarimport [-h] [--merge-modules] [-nc] [-o=<outputFile>]
                        [-u=<user>] [-m=<metrics>]... URL PROJECT_ID
```

### Examples

```
ccsh sonarimport <url> <projectKey> --user=<userToken> --output-file=<fileName> --merge-modules=<Boolean>
```

If you use SonarQube locally, an example command would look like the following:

```
ccsh sonarimport "http://localhost:9000/" "CodeCharta" "--user=squ_12345" "--output-file=output" "--merge-modules=false"
```
