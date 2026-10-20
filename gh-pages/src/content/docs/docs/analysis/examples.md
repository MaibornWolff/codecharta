---
title: "Analysis examples"
description: "Copy-paste ccsh examples: map a repository in one step, combine code metrics with git history, import Tokei or SonarQube and run in Docker."
sidebar:
  label: "Examples"
---

These examples take you from a cloned repository to a map you can open in the visualization. They use the
[JUnit 4 repository](https://github.com/junit-team/junit4) because it is small and quick to analyse, but any
project works. Run every command from the folder you clone into.

## Map a repository in one step

```bash
npm i -g codecharta-analysis
git clone https://github.com/junit-team/junit4
ccsh analyse junit4
```

[`ccsh analyse`](/docs/analysis/analyse) runs every code parser that applies, adds the git history and writes
`junit4.cc.json.gz`. Open it in the [Web Studio](https://codecharta.com/visualization/app/index.html), or start the
desktop client with `codecharta-visualization` after `npm i -g codecharta-visualization`.

## Build the map step by step

To choose the parsers and their options yourself, run them one by one and merge the results with the
[Merge Filter](/docs/filter/merge-filter):

```bash
ccsh unifiedparser junit4 -o junit4.source.cc.json
ccsh gitlogparser repo-scan --repo-path junit4 -o junit4.git.cc.json
ccsh merge junit4.source.cc.json.gz junit4.git.cc.json.gz -o junit4.cc.json
```

Each command writes a gzip-compressed file and adds `.gz` to the name you give, so the merge reads the `.gz` files
and writes `junit4.cc.json.gz`.

`ccsh merge` joins the files by path: the metrics of `src/main/java/Foo.java` from one file and from the other end
up on the same building only when both files spell the path the same way. If they do not, the map shows the file
twice, once with each set of metrics. Compare the top levels of both files to spot this:

```bash
ccsh inspect junit4.source.cc.json.gz --levels 1
ccsh inspect junit4.git.cc.json.gz --levels 1
```

When the structures differ, fix one of them with [`ccsh modify`](/docs/filter/structure-modifier) and its
`--move-from`/`--move-to` or `--set-root` options before you merge.

## Count lines with Tokei

The [Tokei Importer](/docs/importer/tokei) reads the output of [Tokei](https://github.com/XAMPPRocky/tokei), which
counts lines for over 200 languages but measures nothing else. Install Tokei first.

```bash
git clone https://github.com/apache/httpd.git
cd httpd && tokei -o json . > ../httpd.tokei.json && cd ..
ccsh tokeiimporter httpd.tokei.json -o httpd.tokei.cc.json
```

## Import metrics from SonarQube

Once SonarQube has analysed your project, the [Sonar Importer](/docs/importer/sonar) turns its metrics into a map:

```bash
ccsh sonarimport http://localhost:9000 <project-key> --user-token=<token> -o project.sonar.cc.json
```

[Analyze a project with SonarQube](/docs/analysis/example-sonar-qube) shows how to set up a local server and run
the analysis.

## Run in Docker

With [Docker](https://docs.docker.com/get-docker/) you can run the analysis and the visualization without
installing Java or Node. Start the containers from the `docker-compose.yml` of the CodeCharta repository and open a
shell in the analysis container:

```bash
docker compose pull && docker compose up --detach
docker exec -it codecharta-analysis bash
```

Inside the container, `ccsh` and `simplecc.sh` are ready to use (see
[the CodeCharta Shell](/docs/analysis/codecharta-shell#analyse-with-simpleccsh)). The containers share no volume,
so copy a map out with [`docker cp`](https://docs.docker.com/reference/cli/docker/container/cp/):

```bash
docker cp codecharta-analysis:/path/to/project.cc.json.gz .
```

Then open `localhost:9001` in your browser and load the file. [Docker](/docs/overview/getting-started/docker) has
the full setup.

## Next steps

- [CodeCharta Shell](/docs/analysis/codecharta-shell): every parser, importer and filter
- [Available metrics](/docs/analysis/metrics): the metrics worth starting with
- [Web Studio](/docs/visualization/web-studio): explore the map
