---
permalink: /docs/sonar-importer
title: "Sonar Importer"
---

The Sonar-Importer generates visualisation data from SonarQube data through an API call to a SonarQube server.

## Parameter and Usage

| Parameter                       | description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `URL`                           | url of sonarqube server                                           |
| `PROJECT_ID`                    | sonarqube project id                                              |
| `--merge-modules`               | merges modules in multi-module projects                           |
| `-h, --help`                    | displays help                                                     |
| `-m, --metrics=<metrics>`       | comma-sepetated list of metrics to import                         |
| `-o, --outputFile=<outputFile>` | output File (or empty for stdout)                                 |
| `-nc, --not-compressed`         | uncompresses outputfile to json format, if format of File is gzip |
| `-u, --user=<user>`             | user token for connecting to remote sonar instance                |

The command

> ccsh sonarimport \<url of server> \<projectBuilder id>

prints the visualisation data to stdout (or a file if option `-o <filename>` is given).

SonarImporter ignores the multi-module structure of sonar projects if the toggle `--merge-modules` is set.

Further usage information may be retrieved through

> ccsh sonarimport -h

_Alternatively you can use the interactive mode, if you type `ccsh` into your terminal and select the sonar importer._

_Note_: If a project is piped into the [SourceCodeParser]({{site.baseurl}}{% link _docs/04-02-sourcecodeparser.md %}), the results and the piped project are merged.
The resulting project has the project name specified for the SonarImporter.

### Example

> ccsh sonarimport \<url> \<projectKey> --user=\<userToken> --output-file=\<fileName> --merge-modules=\<Boolean>

If you use SonarQube locally, an example command would look like the following:

> ccsh sonarimport "http://localhost:9000/" "CodeCharta" "--user=squ_12345" "--output-file=output" "--merge-modules=false"
