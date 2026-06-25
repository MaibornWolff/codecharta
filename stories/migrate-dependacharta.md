# Migrate DependaCharta into CodeCharta (Suite)

**As a** maintainer and user of CodeCharta
**I want** DependaCharta migrated into CodeCharta
**So that** it becomes part of one CodeCharta suite instead of a separate tool

## Acceptance Criteria
- [ ] DependaCharta is integrated into the CodeCharta repo/suite structure (analysis and/or visualization as applicable)
- [ ] Its output maps onto the new cc.json 2.0 `lenses.dependency` lens (edges as before)
- [ ] Users can produce DependaCharta data through the CodeCharta CLI (`ccsh`)
- [ ] The visualization can load and display the dependency lens within the suite
- [ ] Build, dependencies, styling, and architecture align with CodeCharta conventions, not the standalone tool's
- [ ] Existing DependaCharta capabilities are preserved (no feature loss in the migration)
- [ ] Documentation is updated to present it as part of the suite
- [ ] Tests are migrated/added and the suite's test runs pass

## Notes
- Depends on the cc.json 2.0 DTO (`lenses.dependency`) being defined and agreed — see `cc-json-2-dto.md`.
- Completes the suite direction alongside DomainLanguageCharta and SBOM — see `migrate-domainlanguagecharta.md` and `integrate-sbom-analysis.md`.
