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
            name: "feature-globalSettings-no-external-access-to-services",
            severity: "error",
            comment: "GlobalSettings services can only be accessed within the globalSettings feature",
            from: {
                pathNot: "^app/codeCharta/features/globalSettings/"
            },
            to: {
                path: "^app/codeCharta/features/globalSettings/services/"
            }
        },
        {
            name: "feature-changelog-no-external-access-to-services",
            severity: "error",
            comment: "Changelog services can only be accessed within the changelog feature",
            from: {
                pathNot: "^app/codeCharta/features/changelog/"
            },
            to: {
                path: "^app/codeCharta/features/changelog/services/"
            }
        },
        {
            name: "feature-fileSelector-no-external-access-to-services",
            severity: "error",
            comment: "FileSelector services can only be accessed within the fileSelector feature",
            from: {
                pathNot: "^app/codeCharta/features/fileSelector/"
            },
            to: {
                path: "^app/codeCharta/features/fileSelector/services/"
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
            name: "feature-no-circular-dependencies",
            severity: "error",
            comment: "Prevent circular dependencies within features folder",
            from: {
                path: "^app/codeCharta/features/"
            },
            to: {
                circular: true
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
        },
        {
            name: "feature-no-angular-material",
            severity: "error",
            comment: "Features must use DaisyUI instead of Angular Material. No @angular/material imports allowed.",
            from: {
                path: "^app/codeCharta/features/"
            },
            to: {
                path: "@angular/material"
            }
        },
        {
            name: "feature-no-angular-cdk",
            severity: "error",
            comment: "Features must not use Angular CDK (comes with Material). Use native solutions or DaisyUI.",
            from: {
                path: "^app/codeCharta/features/"
            },
            to: {
                path: "@angular/cdk"
            }
        },
        {
            name: "feature-components-use-services-not-store",
            severity: "error",
            comment: "Feature components should use services, not import directly from stores/",
            from: {
                path: "^app/codeCharta/features/[^/]+/components/"
            },
            to: {
                path: "^app/codeCharta/features/[^/]+/stores/"
            }
        },
        {
            name: "feature-no-external-access-to-stores",
            severity: "error",
            comment: "Feature stores can only be accessed within the same feature (use facade or services for external access)",
            from: {
                path: "^app/codeCharta/features/([^/]+)/",
                pathNot: "^app/codeCharta/features/([^/]+)/(stores|services|facade\\.ts)"
            },
            to: {
                path: "^app/codeCharta/features/\\1/stores/"
            }
        },
        {
            name: "feature-fileSelector-cross-feature-access",
            severity: "error",
            comment: "Other features can only access fileSelector via facade.ts or components/",
            from: {
                path: "^app/codeCharta/features/(?!fileSelector/)"
            },
            to: {
                path: "^app/codeCharta/features/fileSelector/(services|stores)/"
            }
        },
        {
            name: "feature-no-external-access-to-components",
            severity: "error",
            comment: "Feature components are internal. Export via facade.ts for external use.",
            from: {
                path: "^app/codeCharta/",
                pathNot: "^app/codeCharta/features/([^/]+)/"
            },
            to: {
                path: "^app/codeCharta/features/([^/]+)/components/",
                pathNot: "^app/codeCharta/features/\\1/"
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
