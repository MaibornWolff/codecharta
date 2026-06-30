/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: "no-circular",
            severity: "warn",
            comment: "Prevent circular dependencies between modules (currently warn until existing violations are fixed)",
            from: {},
            to: {
                circular: true
            }
        },
        {
            name: "no-orphans",
            severity: "info",
            comment: "Warn about orphan modules (files not imported anywhere)",
            from: {
                orphan: true,
                pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "(^|/)\\.[^/]+\\.[jt]s$", "app/main\\.ts$", "conf/", "script/"]
            },
            to: {}
        },
        {
            name: "feature-no-external-access-to-internals",
            severity: "error",
            comment: "Feature internals can only be accessed within the same feature. External code must use facade.ts or components/",
            from: {
                pathNot: "^app/codeCharta/features/"
            },
            to: {
                path: "^app/codeCharta/features/",
                pathNot: ["^app/codeCharta/features/[^/]+/(components/|facade\\.ts$)"]
            }
        },
        {
            name: "feature-cross-feature-only-via-public-api",
            severity: "error",
            comment:
                "Cross-feature imports must go through facade.ts or components/. Direct access to services, stores, selectors, model is forbidden. (e2e/page-object test files are exempt: they compose features and must not pull page objects through the runtime facade, which would bundle test/node deps.)",
            from: {
                path: "^app/codeCharta/features/([^/]+)/",
                pathNot: ["\\.e2e\\.ts$", "\\.po\\.ts$"]
            },
            to: {
                path: "^app/codeCharta/features/([^/]+)/",
                pathNot: ["^app/codeCharta/features/$1/", "^app/codeCharta/features/[^/]+/(components/|facade\\.ts$)"]
            }
        },
        {
            name: "feature-types-cannot-import-from-feature-internals",
            severity: "error",
            comment: "Features: types/ folder can only contain type definitions and cannot import from services, stores, or effects",
            from: {
                path: "^app/codeCharta/features/[^/]+/types/"
            },
            to: {
                path: "^app/codeCharta/features/[^/]+/(services|stores|effects)/"
            }
        },
        {
            name: "feature-no-circular-dependencies-between-features",
            severity: "error",
            comment:
                "Prevent circular dependencies BETWEEN features (cross-feature only; intra-feature cycles are covered by the app-wide 'no-circular' rule). The codeMap/viewCube rendering cluster is grandfathered out: making codeMap a feature surfaced real bidirectional couplings (codeMap<->viewCube — the cube renders into the map's interaction layer while the map renders the cube; codeMap<->labelSettings — mouse/render events drive labels while labels draw into the scene; codeMap<->sidebarInspector; viewCube->viewCubeToolbox->codeMap). Every current cross-feature cycle edge touches codeMap or viewCube, so those two are exempted via pathNot while the rest of the feature graph stays enforced. Break these via dependency inversion and drop the exemption in a follow-up.",
            from: {
                path: "^app/codeCharta/features/([^/]+)/",
                pathNot: "^app/codeCharta/features/(codeMap|viewCube)/"
            },
            to: {
                path: "^app/codeCharta/features/([^/]+)/",
                pathNot: ["^app/codeCharta/features/$1/", "^app/codeCharta/features/(codeMap|viewCube)/"],
                circular: true
            }
        },
        {
            name: "no-component-scss-files",
            severity: "error",
            comment:
                "Component SCSS is not allowed under app/codeCharta/ (the ui/ -> features/ migration is complete); use daisyUI/Tailwind. Global styles live in app/app.scss + app/mixins.scss.",
            from: {},
            to: {
                path: "^app/codeCharta/.*\\.scss$"
            }
        },
        {
            name: "no-angular-material",
            severity: "error",
            comment: "Angular Material has been fully removed from the app, use DaisyUI instead",
            from: {
                path: "^app/codeCharta/",
                pathNot: "\\.spec\\.ts$"
            },
            to: {
                path: "@angular/(material|cdk)"
            }
        },
        {
            name: "feature-only-stores-can-import-ngrx-store",
            severity: "error",
            comment: "Only stores/ folder can import from @ngrx/store. Components use services, services use stores.",
            from: {
                path: "^app/codeCharta/features/[^/]+/",
                pathNot: ["^app/codeCharta/features/[^/]+/(stores|selectors)/", "\\.spec\\.ts$"]
            },
            to: {
                path: "@ngrx/store"
            }
        },
        {
            name: "wire-dto-only-in-filestore-boundary",
            severity: "error",
            comment:
                "codeCharta.api.model is the cc.json wire DTO — the data contract with the CLI. Only the fileStore ingestion boundary may depend on it: the moved load pipeline (fileStore/loaders), the navBar gameObjects importer, and util/fileDownloader (export). Keeping it out of rendering/state/UI/lenses means a cc.json format change (2.0) stays contained to the ingestion seam. The 2.0 domain types live in model/ccjson2.model.ts, which must NOT import api.model (so model/ is not allow-listed). Test/mocks/fixtures are exempt.",
            from: {
                pathNot: [
                    "^app/codeCharta/fileStore/",
                    "^app/codeCharta/features/navBar/util/gameObjectsParser/",
                    "^app/codeCharta/util/fileDownloader\\.ts$",
                    "^app/codeCharta/mocks/",
                    "^app/codeCharta/resources/",
                    "\\.spec\\.ts$",
                    "\\.e2e\\.ts$",
                    "\\.mocks\\.ts$"
                ]
            },
            to: {
                path: "^app/codeCharta/codeCharta\\.api\\.model\\.ts$"
            }
        },

        /* ───────────── Visualization 2.0 — Slice 1 lens/fileStore boundary (staged at warn) ─────────────
         * Scoped to the dirs that exist this slice (lenses/metrics, fileStore). Step 7 flips the 7
         * lens-internal rules to `error` and keeps `metrics-lens-ngrx-guard` + `new-must-not-import-legacy`
         * at `warn` (documented temporary bridges). See migration-2-0-plans/rpi-plan/step-1-skeleton-and-model.md. */
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
                "Outside code (pages, shell, legacy features) may touch a lens only through its public surface: the lens facade (for data) or a feature's components/ (to mount a panel). Never services, repos, stores, models.",
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
            comment: "Components take their data from services. A lens feature component may not import a repo or store directly — go via the feature's services.",
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
            name: "metrics-lens-ngrx-guard",
            severity: "warn",
            comment:
                "Lens code may import @ngrx/store only from a lens's repos/store (or a lens feature's stores/selectors). Staged at warn now so step 7 only flips it; stays warn until viewState/appearance land.",
            from: {
                path: "^app/codeCharta/lenses/",
                pathNot: [
                    "^app/codeCharta/lenses/[^/]+/(repos|store)/",
                    "^app/codeCharta/lenses/[^/]+/features/[^/]+/(stores|selectors)/",
                    "\\.spec\\.ts$"
                ]
            },
            to: { path: "@ngrx/store" }
        },
        {
            name: "new-must-not-import-legacy",
            severity: "warn",
            comment:
                "Migration boundary: the new structure (lenses/, fileStore/) must not import the legacy features/ or state/. Kept at warn this slice because real transitional edges exist; util/ + model/ are the shared kernel and exempt. The reverse (legacy → new lens facade) is the allowed migration flow. Flips to error once state/ becomes interaction/appearance.",
            from: { path: "^app/codeCharta/(lenses|fileStore)/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: ["^app/codeCharta/features/", "^app/codeCharta/state/"] }
        }
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
            dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"]
        },
        exclude: {
            // Test fixtures are not production architecture: keep the mocks/ folder and
            // any *.mocks.ts file out of the dependency graph and the boundary rules so
            // they don't obscure real structure (they are only ever imported by tests).
            path: ["(^|/)node_modules/(?!@(ngrx|angular)/)", "^app/codeCharta/mocks/", "\\.mocks\\.ts$"]
        },
        tsPreCompilationDeps: true,
        tsConfig: {
            fileName: "tsconfig.json"
        },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "require", "node", "default", "types"],
            mainFields: ["module", "main", "types", "typings"],
            extensions: [".ts", ".js", ".json"]
        },
        reporterOptions: {
            dot: {
                collapsePattern: "^node_modules/(@[^/]+/[^/]+|[^/]+)",
                theme: {
                    graph: {
                        splines: "ortho"
                    }
                }
            },
            archi: {
                collapsePattern: "^app/codeCharta/(features/[^/]+|lenses/[^/]+|fileStore)",
                theme: {
                    graph: {
                        splines: "ortho"
                    }
                }
            },
            text: {
                highlightFocused: true
            }
        }
    }
}
