# Migrate DomainLanguageCharta into CodeCharta (Suite)

**As a** maintainer and user of CodeCharta
**I want** DomainLanguageCharta migrated into CodeCharta
**So that** it becomes part of one CodeCharta suite instead of a separate tool

## Acceptance Criteria
- [ ] DomainLanguageCharta is integrated into the CodeCharta repo/suite structure (analysis and/or visualization as applicable)
- [ ] Its output maps onto the new cc.json 2.0 `lenses.domain` lens
- [ ] Users can run/produce DomainLanguageCharta data through the CodeCharta CLI (`ccsh`)
- [ ] The visualization can load and display the domain lens within the suite
- [ ] Shared concerns (build, dependencies, styling, architecture) align with CodeCharta conventions, not the standalone tool's
- [ ] Existing DomainLanguageCharta capabilities are preserved (no feature loss in the migration)
- [ ] Documentation is updated to present it as part of the suite
- [ ] Tests are migrated/added and the suite's test runs pass

## Notes
- Depends on the cc.json 2.0 DTO (`lenses.domain`) being defined and agreed — see `cc-json-2-dto.md`.
- Part of the broader suite direction alongside other lenses (dependency, security).
