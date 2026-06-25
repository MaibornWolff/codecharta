# Integrate SBOM Analysis

**As a** user of CodeCharta
**I want** SBOM (Software Bill of Materials) analysis integrated into the suite
**So that** I can see dependencies/components and their security-relevant information alongside the code map

## Acceptance Criteria
- [ ] CodeCharta can ingest SBOM data (e.g. CycloneDX / SPDX) through the CLI (`ccsh`)
- [ ] SBOM output maps onto the new cc.json 2.0 lenses (`lenses.security`, and `lenses.dependency` where relevant)
- [ ] The visualization can load and display the SBOM-derived lens within the suite
- [ ] Component metadata (name, version, license, known vulnerabilities) is represented per node where applicable
- [ ] Integration follows CodeCharta conventions (CLI structure, feature architecture, daisyUI styling)
- [ ] Documentation explains how to generate and visualize SBOM data
- [ ] Tests cover SBOM ingestion and the resulting lens, and the suite's test runs pass

## Notes
- Depends on the cc.json 2.0 DTO (`lenses.security` / `lenses.dependency`) being defined — see `cc-json-2-dto.md`.
- Continues the suite direction after DomainLanguageCharta — see `migrate-domainlanguagecharta.md`.
