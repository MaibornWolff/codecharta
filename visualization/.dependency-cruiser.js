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
        }
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
            dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"]
        },
        exclude: {
            path: "(^|/)node_modules/(?!@(ngrx|angular)/)"
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
                collapsePattern: "^app/codeCharta/features/([^/]+)",
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
