---
permalink: /docs/new-to-code/
title: "New to this Code?"
---

Thank you for being interested in CodeCharta. You should first familiarize yourself with the [quick-start guide]({{site.baseurl}}{% link _docs/01-01-quick-start-guide.md %}), and the difference between [analysis]({{site.baseurl}}{% link _docs/05-01-analysis.md %}) and the [visualization]({{site.baseurl}}{% link _docs/06-01-visualization.md %}). Afterwards it makes sense to check the [architecture decision records (ADR)]({{site.baseurl}}/categories/#adr) to get up to speed with the decisions we have made so far. It's also important to know that CodeCharta uses [two different tech stacks]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_1_decide_tech_stack.md %}) for analysis and visualization.

Finally, it would be great if you looked at how we give and receive [feedback]({{site.baseurl}}{% link _docs/01-07-feedback.md %}) and after finishing this entire post, please explore our [developer guides]({{site.baseurl}}/categories/#dev-guide).

# Branching / Releasing

We create Pull Requests to the `main` branch after implementing a feature or fixing a bug. There is no release or development branch. We never push on `main` directly. Please take a look at our [contributing guidelines](https://github.com/MaibornWolff/codecharta/blob/main/CONTRIBUTING.md) before you start committing.
When updating your branch, we prefer using a rebase instead of merging to keep the commit history clean.

# Code Style Guide

Besides the rules enforced by our linter, we generally do not follow a set of defined style guidelines for our code.
For the analysis there is an XML file containing a few style rules for your IDE, you can find out more about that in the analysis readme.

# GitHub Actions

In GitHub Actions, we defined stages, which group different jobs. Inside a stage, all jobs run in parallel. There is no data persistence between stages, so we have to rebuild our application in each stage. The CI consists of the following stages:

-   Testing (which runs on every push on an active PR)
-   Sonar Analysis (which runs on every push on an active PR after testing to ensure code quality metrics are met)
-   Deploy (run by `make_release.py`)

All workflow files can be found under `.github/workflows`

### Testing

-   Runs Unit and E2E/UI-Tests
-   Workflow: `test.yml`

### Sonar

-   Publishes Sonar-Analysis-Results to [Sonarcloud.io](https://sonarcloud.io) and displays code-quality of the current PR
-   Workflow: `test.yml`

### Deploy

-   Deploys the application in a docker container to the github-pages
-   Publishes the new version on npm
-   Publishes a docker container on [Docker Hub](https://hub.docker.com/r/codecharta/codecharta-visualization)

-   Workflow: `release.yml`

# Common Issues

There are a few issues regularly occurring when trying to start contributing. This aims to be like a FAQ section to help address the most common problems.

### General

1. Error `lint-staged: command not found` when trying to commit: Try to reinstall the node packages in the project. To do that, visit the root directory of the project (and the subdirectories for analysis and visualization if that still fails) and execute `npm ci`.

### Analysis

1. First build fails on new setup: One of our parsers depends on MetricGardener which is a multi-language parser to calculate metrics for a variety of languages. Therefore, make sure to install MetricGardener before trying to build the project. Also make sure that `metric-gardener` is available in your CLI. You can find more information on the documentation page about the [MetricGardenerImporter]({{site.baseurl}}{% link _docs/04-13-metricgardener.md %}).

# Further documentation

For further information please check out the documentation pages for the [analysis]({{site.baseurl}}{% link _docs/07-02-new-to-code-analysis.md %}) and [visualization]({{site.baseurl}}{% link _docs/07-03-new-to-code-visualization.md %}) parts of the project.
