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
                pathNot: ["^app/codeCharta/features/", "\\.spec\\.ts$"]
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
                "Cross-feature imports must go through facade.ts or components/. Direct access to services, stores, selectors, model is forbidden.",
            from: {
                path: "^app/codeCharta/features/([^/]+)/",
                pathNot: "\\.spec\\.ts$"
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
            comment: "Prevent circular dependencies between features",
            from: {
                path: "^app/codeCharta/features/([^/]+)/"
            },
            to: {
                path: "^app/codeCharta/features/([^/]+)/",
                circular: true
            }
        },
        {
            name: "features-no-scss-files",
            severity: "error",
            comment: "SCSS files are not allowed in features/ directory, use daisyui instead",
            from: {},
            to: {
                path: "^app/codeCharta/features/.*\\.scss$"
            }
        },
        {
            name: "feature-only-stores-can-import-ngrx-store",
            severity: "error",
            comment: "Only stores/ folder can import from @ngrx/store. Components use services, services use stores.",
            from: {
                path: "^app/codeCharta/features/[^/]+/",
                pathNot: "^app/codeCharta/features/[^/]+/stores/"
            },
            to: {
                path: "@ngrx/store",
                pathNot: "@ngrx/store-devtools"
            }
        }
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
            dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"]
        },
        includeOnly: "^app/",
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
