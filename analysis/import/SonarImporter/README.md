# SonarImporter

Generates visualisation data from SonarQube data through an API call to a SonarQube server.

## Usage and Parameters

| Parameter                        | description                                                                                                                                                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
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

## Examples

```
ccsh sonarimport \<url of server> \<projectBuilder id>
```

If a project is piped into the SonarImporter, the results and the piped project are merged.
The resulting project has the project name specified for the SonarImporter.
