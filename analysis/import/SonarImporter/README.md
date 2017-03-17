# SonarImporter

Generates visualisation data from SonarQube data through a xml file or an API call to a SonarQube server.

The importer is limited to projects with less than 500 components.

## Usage

### Remote call to SonarQube server

The command

> ccsh sonarimport \<url of server> \<project id>

prints the visualisation data to stdout (or a file if option `-o <filename>` is given).

### Manual import

You can download an xml file containing SonarQube data from a server using the script `get_sonar` and call

> ccsh sonarimport \<xml file>

which prints the visualisation data to stdout.

Further usage information may be retrieved through

> ccsh sonarimport -h
