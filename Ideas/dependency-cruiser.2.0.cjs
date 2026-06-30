/**
 * CodeCharta 2.0 — dependency-cruiser rules for the LENS / RENDERER / PAGE architecture.
 *
 * DRAFT. This is written against the *target* folder structure (see
 * Ideas/codecharta-2.0-implementation-map.html). It does not match today's `features/` tree, so it
 * will only pass once the migration lands. When adopted, it replaces `visualization/.dependency-cruiser.js`.
 *
 * It keeps the project's existing guarantees (public surface = facade/components, only state-holders
 * import @ngrx/store, no SCSS, no Angular Material, wire-DTO is boundary-only) and adds the new
 * layering:
 *
 *   FileStore ─▶ Lenses (facade · features{f·m·c·s} · repos · store) ─▶ Pages ─▶ dumb Renderer engines
 *   Interaction / Appearance / ViewState = leaf state.  Shell hosts pages + non-lens features.
 *
 * Direction of allowed dependency (a layer may import only from layers below it):
 *   shell ▶ pages ▶ {lens facades, renderer engine facade, view/appearance/interaction} ▶ repos ▶ store ▶ fileStore ▶ model/util
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
    forbidden: [
        {
            name: "no-circular",
            severity: "warn",
            comment: "Prevent circular dependencies (warn until existing violations are fixed).",
            from: {},
            to: { circular: true }
        },
        {
            name: "no-orphans",
            severity: "info",
            comment: "Warn about orphan modules (files not imported anywhere).",
            from: {
                orphan: true,
                pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "(^|/)\\.[^/]+\\.[jt]s$", "app/main\\.ts$", "conf/", "script/"]
            },
            to: {}
        },

        /* ───────────────────────── RENDERERS — dumb engines ───────────────────────── */
        {
            name: "renderer-engine-stays-dumb",
            severity: "error",
            comment:
                "A renderer engine knows geometry, not cc.json. It must NOT import lenses, the page that drives it, shell, or any state (interaction/appearance/viewState) or the wire model. Engines may use three, util and their own internals only.",
            from: { path: "^app/codeCharta/renderers/[^/]+/engine/" },
            to: {
                path: [
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/shell/",
                    "^app/codeCharta/interaction/",
                    "^app/codeCharta/appearance/",
                    "^app/codeCharta/fileStore/",
                    "^app/codeCharta/renderers/[^/]+/page/",
                    "^app/codeCharta/renderers/[^/]+/viewState/",
                    "^app/codeCharta/codeCharta\\.(api\\.)?model\\.ts$"
                ]
            }
        },
        {
            name: "page-uses-engine-public-api",
            severity: "error",
            comment:
                "The page drives the engine through its public entry only (renderers/<r>/engine/<r>.engine.ts) — not the engine's three/geometry internals.",
            from: { path: "^app/codeCharta/renderers/[^/]+/page/" },
            to: {
                path: "^app/codeCharta/renderers/[^/]+/engine/",
                pathNot: "^app/codeCharta/renderers/[^/]+/engine/[^/]+\\.engine\\.ts$"
            }
        },

        /* ───────────────────────── LENSES — data modules ───────────────────────── */
        {
            name: "lens-no-ui-dependency",
            severity: "error",
            comment: "A lens is data. It must not import renderers or shell. (It may read interaction/appearance/fileStore facades.)",
            from: { path: "^app/codeCharta/lenses/" },
            to: { path: ["^app/codeCharta/renderers/", "^app/codeCharta/shell/"] }
        },
        {
            name: "lens-cross-lens-only-via-facade",
            severity: "error",
            comment: "One lens may not reach into another lens's internals — only its lens facade (lenses/<other>/<other>.facade.ts).",
            from: { path: "^app/codeCharta/lenses/([^/]+)/" },
            to: {
                path: "^app/codeCharta/lenses/([^/]+)/",
                pathNot: ["^app/codeCharta/lenses/$1/", "^app/codeCharta/lenses/[^/]+/[^/]+\\.facade\\.ts$"]
            }
        },
        {
            name: "lens-external-access-only-via-public-surface",
            severity: "error",
            comment:
                "Outside code (pages, shell, …) may touch a lens only through its public surface: the lens facade (for data) or a feature's components/ (to mount a panel). Never services, repos, stores, models.",
            from: { pathNot: "^app/codeCharta/lenses/" },
            to: {
                path: "^app/codeCharta/lenses/",
                pathNot: [
                    "^app/codeCharta/lenses/[^/]+/[^/]+\\.facade\\.ts$",
                    "^app/codeCharta/lenses/[^/]+/features/[^/]+/components/"
                ]
            }
        },
        {
            name: "lens-feature-cross-only-via-public-api",
            severity: "error",
            comment: "Within a lens, a feature may reach another feature only via its facade.ts or components/ (not its services/stores/models).",
            from: { path: "^app/codeCharta/lenses/[^/]+/features/([^/]+)/", pathNot: ["\\.e2e\\.ts$", "\\.po\\.ts$"] },
            to: {
                path: "^app/codeCharta/lenses/[^/]+/features/([^/]+)/",
                pathNot: [
                    "^app/codeCharta/lenses/[^/]+/features/$1/",
                    "^app/codeCharta/lenses/[^/]+/features/[^/]+/(components/|facade\\.ts$)"
                ]
            }
        },
        {
            name: "feature-components-go-through-services",
            severity: "error",
            comment: "Components take their data from services. A feature component may not import a repo or store directly — go via the feature's services.",
            from: { path: "^app/codeCharta/lenses/[^/]+/features/[^/]+/components/" },
            to: { path: ["^app/codeCharta/lenses/[^/]+/repos/", "^app/codeCharta/lenses/[^/]+/store/"] }
        },
        {
            name: "feature-services-read-repos-not-store",
            severity: "error",
            comment: "Services hold logic and read the repo. They must not reach the raw store directly — the repo is the data-access seam.",
            from: { path: "^app/codeCharta/lenses/[^/]+/features/[^/]+/services/" },
            to: { path: "^app/codeCharta/lenses/[^/]+/store/" }
        },

        /* ───────────────────────── STATE — single ngrx owner ───────────────────────── */
        {
            name: "only-state-holders-import-ngrx-store",
            severity: "error",
            comment:
                "Only the state-holding folders may import @ngrx/store: lens repos/store, the renderer viewState, and the interaction / appearance / fileStore slices. Components → services → repos; nothing else touches ngrx.",
            from: {
                path: "^app/codeCharta/",
                pathNot: [
                    "^app/codeCharta/lenses/[^/]+/(repos|store)/",
                    "^app/codeCharta/renderers/[^/]+/viewState/",
                    "^app/codeCharta/(interaction|appearance|fileStore)/",
                    "\\.spec\\.ts$"
                ]
            },
            to: { path: "@ngrx/store" }
        },

        /* ───────────────────────── LEAF STATE & SOURCE ───────────────────────── */
        {
            name: "shared-state-is-leaf",
            severity: "error",
            comment: "Interaction and appearance are leaf state — they must not import lenses, renderers or shell (they are read by them, not the reverse).",
            from: { path: "^app/codeCharta/(interaction|appearance)/" },
            to: { path: ["^app/codeCharta/lenses/", "^app/codeCharta/renderers/", "^app/codeCharta/shell/"] }
        },
        {
            name: "filestore-has-no-upward-deps",
            severity: "error",
            comment: "FileStore is the source. It must not import lenses, renderers, shell, interaction or appearance.",
            from: { path: "^app/codeCharta/fileStore/" },
            to: {
                path: [
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/renderers/",
                    "^app/codeCharta/shell/",
                    "^app/codeCharta/interaction/",
                    "^app/codeCharta/appearance/"
                ]
            }
        },
        {
            name: "components-are-dumb-primitives",
            severity: "error",
            comment: "Shared components are presentational primitives. They must not import lenses, renderers, shell, state or fileStore — they only render what they are handed.",
            from: { path: "^app/codeCharta/components/" },
            to: {
                path: [
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/renderers/",
                    "^app/codeCharta/shell/",
                    "^app/codeCharta/interaction/",
                    "^app/codeCharta/appearance/",
                    "^app/codeCharta/fileStore/"
                ]
            }
        },

        /* ───────────────────────── CARRIED OVER FROM TODAY ───────────────────────── */
        {
            name: "wire-dto-only-in-filestore-boundary",
            severity: "error",
            comment:
                "codeCharta.api.model is the cc.json 2.0 wire DTO. Only the fileStore loaders/exporters (and the domain model) may depend on it, so a future format change stays contained to the ingestion seam.",
            from: {
                pathNot: [
                    "^app/codeCharta/fileStore/",
                    "^app/codeCharta/model/",
                    "^app/codeCharta/util/fileDownloader\\.ts$",
                    "^app/codeCharta/mocks/",
                    "^app/codeCharta/resources/",
                    "\\.spec\\.ts$",
                    "\\.e2e\\.ts$",
                    "\\.mocks\\.ts$"
                ]
            },
            to: { path: "^app/codeCharta/codeCharta\\.api\\.model\\.ts$" }
        },
        {
            name: "no-component-scss-files",
            severity: "error",
            comment: "Component SCSS is not allowed under app/codeCharta/; use daisyUI/Tailwind. Global styles live in app/app.scss + app/mixins.scss.",
            from: {},
            to: { path: "^app/codeCharta/.*\\.scss$" }
        },
        {
            name: "no-angular-material",
            severity: "error",
            comment: "Angular Material has been removed from the app; use DaisyUI instead.",
            from: { path: "^app/codeCharta/", pathNot: "\\.spec\\.ts$" },
            to: { path: "@angular/(material|cdk)" }
        }
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
            dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"]
        },
        exclude: {
            path: ["(^|/)node_modules/(?!@(ngrx|angular)/)", "^app/codeCharta/mocks/", "\\.mocks\\.ts$"]
        },
        tsPreCompilationDeps: true,
        tsConfig: { fileName: "tsconfig.json" },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "require", "node", "default", "types"],
            mainFields: ["module", "main", "types", "typings"],
            extensions: [".ts", ".js", ".json"]
        },
        reporterOptions: {
            dot: { collapsePattern: "^node_modules/(@[^/]+/[^/]+|[^/]+)", theme: { graph: { splines: "ortho" } } },
            // collapse each lens / renderer / top-level area into one node for the architecture graph
            archi: {
                collapsePattern:
                    "^app/codeCharta/(lenses/[^/]+|renderers/[^/]+|shell|interaction|appearance|fileStore|components|model|util)",
                theme: { graph: { splines: "ortho" } }
            },
            text: { highlightFocused: true }
        }
    }
}
