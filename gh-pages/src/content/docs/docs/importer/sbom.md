---
title: "SBOM Importer"
description: "The SBOM importer reads a CycloneDX SBOM and adds the project's third-party packages, their known vulnerabilities and how far they are behind to the map."
---

The SBOM importer reads a [CycloneDX](https://cyclonedx.org/) JSON SBOM (software bill of materials) and adds the
third-party packages your project ships to the map's security lens: each package once, its known vulnerabilities, and,
when you ask for it, how far it is behind its newest stable version. The lockfiles the SBOM was made from appear on the
map and carry their packages; the Web Studio shows them as map metrics and in the
Security view.

It needs neither a build nor the project's dependencies: a scanner that reads lockfiles is enough.

## Quick start

Create the SBOM with a scanner that also checks vulnerabilities, then import it in the project folder:

```bash
trivy fs --offline-scan --scanners vuln --format cyclonedx --output bom.cdx.json .
ccsh sbomimport bom.cdx.json -o sbom.cc.json
```

`--offline-scan` keeps Trivy from asking Maven Central about parent POMs; it still downloads its vulnerability
database once a day. Any CycloneDX JSON works, for example from [cdxgen](https://github.com/CycloneDX/cdxgen) or
[Syft](https://github.com/anchore/syft); without a vulnerability scanner add `--osv`.

`ccsh analyse --sbom=bom.cdx.json` maps the code and adds the SBOM in one step. Otherwise pipe a map in to add the lens
to it, or merge the result with `ccsh merge`:

```bash
ccsh unifiedparser . | ccsh sbomimport bom.cdx.json -o project.cc.json
```

## Options

| Option                           | Description                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `FILE`                           | the CycloneDX JSON SBOM                                                             |
| `--project-folder=<folder>`      | the folder the SBOM was made from, to find its lockfiles in (default: the current one) |
| `--osv`                          | ask OSV.dev for vulnerabilities of packages no scanner checked                      |
| `--deps-dev`                     | ask deps.dev for newer versions to measure dependency lag and outdated packages      |
| `-o, --output-file=<outputFile>` | output file; prints to stdout when omitted                                           |
| `-nc, --not-compressed`          | write plain JSON instead of a gzip file                                              |
| `-h, --help`                     | show the help and exit                                                               |

```text
Usage: ccsh sbomimport [-h] [-nc] [--deps-dev] [--osv] [-o=<outputFile>] [--project-folder=<projectFolder>] FILE
```

## What it measures

| Field                 | Meaning                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| vulnerabilities       | known vulnerabilities with severity (from the highest CVSS v3 score), score and the versions that fix them |
| newest version        | the newest stable version (`--deps-dev`)                                                                  |
| newer versions        | how many stable versions are newer than the used one (`--deps-dev`)                                       |
| days outdated         | days since the first newer stable version was released, 0 when up to date (`--deps-dev`)                  |
| libyears              | years between the release of the used and of the newest version (`--deps-dev`)                           |

Nothing is guessed: what was not measured stays empty and the importer says why in its last lines.

- **Vulnerabilities** count as measured when the SBOM names a vulnerability scanner (Trivy, Grype, Snyk, OSV-Scanner,
  Docker Scout) and carries its findings, or when `--osv` ran. With `--osv` the importer asks OSV.dev only about the
  packages no scanner checked.
- **Versions** come from [deps.dev](https://deps.dev) for npm, Maven, PyPI, Go, Cargo, NuGet and RubyGems. Pre-releases
  never count as newer. The lookup date is stored with the map, so the days stay the same when you open it later.
- A component without a version is the project's own module (a Go main module, a workspace package) and is left out.

## Online lookups

Both lookups are off by default, so the importer runs without a network. `--osv` sends the package names and versions
of your dependencies to `api.osv.dev`, `--deps-dev` sends their names to `api.deps.dev`. Neither sends your code.

## Related

- [Data privacy](/docs/overview/data-privacy): what leaves your machine
