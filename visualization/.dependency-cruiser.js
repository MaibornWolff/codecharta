/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        ...require("./conf/dependencyCruiser/generalRules"),
        ...require("./conf/dependencyCruiser/viewAndFeatureRules"),
        ...require("./conf/dependencyCruiser/lensRules"),
        ...require("./conf/dependencyCruiser/storeRules"),
        ...require("./conf/dependencyCruiser/facadeRules"),
        ...require("./conf/dependencyCruiser/rendererRules"),
        ...require("./conf/dependencyCruiser/utilRules"),
        ...require("./conf/dependencyCruiser/loadRules")
    ],
    options: {
        doNotFollow: {
            // mocks/ + *.mocks.ts are TEST-ONLY fixtures. They are doNotFollow (not exclude) leaves: kept as
            // graph nodes so an INBOUND prod→mock edge is recorded (and caught by no-prod-import-of-mocks),
            // but their OWN imports are not followed, so they never trip a layering rule or pull in new modules.
            path: ["node_modules", "^app/codeCharta/mocks/", "\\.mocks\\.ts$"],
            dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"]
        },
        exclude: {
            path: ["(^|/)node_modules/(?!@(ngrx|angular)/)"]
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
            dot: {
                collapsePattern: "^node_modules/(@[^/]+/[^/]+|[^/]+)",
                theme: { graph: { splines: "ortho" } }
            },
            archi: {
                collapsePattern: "^app/codeCharta/(views|features/[^/]+|renderer/[^/]+|lenses/[^/]+|stores/[^/]+)",
                theme: { graph: { splines: "ortho" } }
            },
            text: { highlightFocused: true }
        }
    }
}
