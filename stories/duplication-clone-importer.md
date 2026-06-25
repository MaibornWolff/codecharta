# Clone-Detector Importer for Duplication Signal

**As a** user of CodeCharta
**I want** a CLI importer that ingests real token/AST clone-detection output and writes a duplication signal into `.cc.json`
**So that** I can see where actual code duplication lives, colored on the map, instead of relying on a filename-and-metrics guess

## Context
The `Ideas/code_duplication_report.html` artifact flags duplication by grouping files with the **same basename** and scoring how **close their metric vectors** are (loc, rloc, complexity, #functions, comment lines). This is a proxy, not clone detection: it produces false positives (coincidentally same-named/same-sized files, version copies across release branches) and is blind to renamed or copy-pasted clones. Its `similarity`/`similarity_label` are precomputed upstream and not auditable from the HTML. We keep only the *idea* of a duplication overview and replace the heuristic with content-based detection.

## Acceptance Criteria
- [ ] A new `ccsh` importer (e.g. `duplicationimport`) ingests output from a real clone detector, starting with **jscpd JSON** (PMD-CPD / Simian XML optional follow-ups)
- [ ] It writes a per-file duplication metric onto file nodes, **reusing the existing Sonar attribute keys** `duplicated_lines` and `duplicated_lines_density` for cross-tool consistency
- [ ] Detector path-to-node resolution is handled (e.g. `/root/` prefixing and path-separator normalization), with clear warnings when paths do not match the cc.json tree
- [ ] The importer surfaces and documents the detector's `min-tokens` / `min-lines` thresholds so boilerplate (getters, imports, generated code) can be controlled
- [ ] Output composes with the existing pipeline: it can be `mergefilter --recursive`-fused onto a UnifiedParser metric map
- [ ] The visualization offers `duplicated_lines` / `duplicated_lines_density` in the area/height/color pickers with **no new viz wiring** (auto-discovered from node attributes; legend/tooltip text comes from the reused descriptors)
- [ ] The importer is registered in `Ccsh.kt` (subcommand + attribute generator) and `settings.gradle.kts`, with interactive `getDialog()` / `isApplicable()` like other importers
- [ ] Detection is delegated to the external tool and the importer is deterministic; the `Ideas/code_duplication_report.html` heuristic is explicitly **not** reimplemented
- [ ] Tests cover each parser with golden report resources, the node-attribute output, and the dialog; the suite's test runs pass
- [ ] Documentation explains the `jscpd … | ccsh duplicationimport …` workflow

## Notes
- **Replaces, not extends, the heuristic.** Be honest in docs: same-basename + metric-vector closeness is a weak proxy; this story supersedes it. The report HTML can be retired once this lands.
- **Scope deliberately narrow for v1:** per-file scalar via jscpd only. N-way clone *classes* and clone-pair *edges* are intentionally deferred — the viz edge pipeline reduces edges to a per-node degree count (magnitudes like `clone_lines` are dropped) and large clone classes blow up O(n²), so edges add clutter without value until clusters exist.
- **cc.json 2.0 alignment:** the per-file scalar maps to `lenses.metrics.attributes`. The natural home for N-way clone groups is the open `clusters` TODO under `lenses.metrics` in `cc-json-2-dto.md` — define that shape there (kind:`clone`, members, metrics) when the DTO is agreed, then a follow-up can have this importer emit clusters.
- **Report view:** a "top duplication / most-duplicated files" section is the in-app home for this data — see `software-report-view.md`. That view becomes a thin presenter over the authoritative `duplicated_lines` metric (and later clusters); it should NOT recompute the basename/metric heuristic client-side.
- Sibling stories: `cc-json-2-dto.md` (clusters shape), `software-report-view.md` (consumer), `migrate-dependacharta.md` (the importer/edge template to mirror).
