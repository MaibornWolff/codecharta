# SBOM Importer

Reads a CycloneDX JSON SBOM into the `security` lens of a cc.json: the third-party packages keyed by purl, their known
vulnerabilities and, with `--deps-dev`, how far each is behind its newest stable version. The lockfiles the SBOM names
are found in `--project-folder` and become file nodes that declare their packages.

User documentation: [SBOM Importer](https://codecharta.com/docs/importer/sbom). The lens itself is described in
[`dev_docs/cc-json-2.0-format.md`](../../../../dev_docs/cc-json-2.0-format.md#the-security-lens).

## Layout

| Package           | Job                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `cyclonedx`       | reads the parts of a CycloneDX document the importer uses                                  |
| `packages`        | one package per purl; versionless components are the project's own modules and left out   |
| `lockfiles`       | finds the lockfiles in the project folder and what each declares                           |
| `vulnerabilities` | embedded findings, CVSS v3 scoring and severity buckets, the OSV.dev lookup                 |
| `versions`        | version order, pre-release rules per ecosystem, the deps.dev lookup and the lag             |
| `http`            | the HTTP gateway with retries; tests replace it                                             |
