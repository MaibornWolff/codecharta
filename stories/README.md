# Stories — Implementation Order

Recommended sequence.

| # | Story | File | Depends on | Notes |
|---|-------|------|-----------|-------|
| 1 | Go Zoneless (remove zone.js) | `remove-zonejs.md` | — | Platform foundation; do before new UI so new components are zoneless-correct. |
| 2 | Migrate remaining UI to feature architecture | `migrate-ui-feature-architecture.md` | 1 | Establishes the slice+facade pattern all later UI work follows. |
| 3 | On-map layout switcher (3D \| Street \| Mixed) | `map-layout-switcher.md` | 2 | Built the new-architecture way. |
| 4 | Cube slider → daisyUI | `cube-slider-daisyui.md` | 2 | Built the new-architecture way. |
| 5 | cc.json 2.0 DTO `{meta, files, lenses}` | `cc-json-2-dto.md` | — (review first) | ⚠️ DRAFT — review/agree before building. Gates 6–10. |
| 6 | Clone-detector importer (duplication signal) | `duplication-clone-importer.md` | 5 | Replaces the `Ideas/` HTML heuristic. Per-file scalar maps to `lenses.metrics.attributes`. |
| 7 | Software Report view (Explore \| Compare \| Report) | `software-report-view.md` | 2, 6 | Thin presenter over real metrics (incl. `duplicated_lines` from #6). Must NOT recompute the duplication heuristic client-side. |
| 8 | Migrate DomainLanguageCharta (domain lens) | `migrate-domainlanguagecharta.md` | 5 | Suite. |
| 9 | Integrate SBOM analysis (security lens) | `integrate-sbom-analysis.md` | 5 | Suite. |
| 10 | Migrate DependaCharta (dependency lens) | `migrate-dependacharta.md` | 5 | Suite. |

## Phases

- **Foundations & UI (1–4):** zone.js removal → feature architecture → the two small UI features built on it.
- **Data contract (5):** the cc.json 2.0 DTO — review and agree before anything downstream. This is the gate for 6–10.
- **Duplication & reporting (6–7):** clone-detector importer, then the in-app Report view that presents its metric.
- **Suite (8–10):** Domain → SBOM → Dependency lenses, all on the agreed 2.0 DTO.

## Critical path

`5 (cc.json 2.0 DTO)` gates everything from 6 onward, so getting it reviewed and agreed is the single
highest-leverage move once the foundations (1–2) are underway.
