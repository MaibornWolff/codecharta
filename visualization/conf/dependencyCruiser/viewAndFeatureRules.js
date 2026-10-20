/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
    {
        name: "nothing-imports-views",
        severity: "error",
        comment:
            "views/ is the TOP layer — routes + page composition (the CodeCharta page today; Graph/Report later). It composes features and owns no logic, so NOTHING inside app/codeCharta/ may import it back. Only the Angular bootstrap (app/app.config.ts, app/main.ts — outside codeCharta/) mounts the page. Spec/e2e exempt (test harness may mount a page). NEW rule: the flat tree had no view layer to fence.",
        from: { path: "^app/codeCharta/", pathNot: ["^app/codeCharta/views/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: { path: "^app/codeCharta/views/" }
    },
    {
        name: "views-do-not-import-sibling-views",
        severity: "error",
        comment:
            "Each view under views/<view>/ composes its own page, so it must not import another view's files. What several views share (the map explorer's rules, tree, search, sort and handed-over node for the metrics and dependency views) is logic, and logic lives in a feature (features/mapExplorer) reached through its facade. Spec/e2e exempt.",
        from: { path: "^app/codeCharta/views/([^/]+)/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: { path: "^app/codeCharta/views/", pathNot: ["^app/codeCharta/views/$1/"] }
    },

    {
        name: "feature-no-external-access-to-internals",
        severity: "error",
        comment:
            "Feature internals can only be accessed within the same feature. External code (now including views/) must use facade.ts or a feature's effects bundle (effects/<feature>.effects.ts) — the latter is the public ngrx-registration manifest imported by the app composition root, which must NOT be routed through the facade (that would pull every effect's cross-feature deps into the facade graph and form cycles). components/ is NO LONGER a public surface: outside code reaches a feature's UI only through facade.ts (which may re-export presentational components). Test files (.spec/.e2e/.po) are exempt — the harness may import a feature's page-objects/components directly.",
        from: { pathNot: ["^app/codeCharta/features/", "\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.po\\.ts$"] },
        to: {
            path: "^app/codeCharta/features/",
            pathNot: ["^app/codeCharta/features/[^/]+/facade\\.ts$", "^app/codeCharta/features/[^/]+/effects/[^/]+\\.effects\\.ts$"]
        }
    },
    {
        name: "feature-cross-feature-only-via-public-api",
        severity: "error",
        comment:
            "Cross-feature imports must go through facade.ts. Direct access to components, services, stores, selectors, model is forbidden. components/ is NO LONGER a public surface — a sibling feature reaches another feature's UI only through its facade.ts (which may re-export presentational components). (Test files — .e2e/.po/.spec — are exempt.)",
        from: {
            path: "^app/codeCharta/features/([^/]+)/",
            pathNot: ["\\.e2e\\.ts$", "\\.po\\.ts$", "\\.spec\\.ts$"]
        },
        to: {
            path: "^app/codeCharta/features/([^/]+)/",
            pathNot: ["^app/codeCharta/features/$1/", "^app/codeCharta/features/[^/]+/facade\\.ts$"]
        }
    },
    {
        name: "feature-services-not-to-components",
        severity: "error",
        comment:
            "Inside a feature the read-order is components -> (services) -> stores: a component may read the feature's own stores/ directly (the feature read/write stores are the injectable state API) or lean on a service for logic, but a service sits BELOW the components it feeds and must not import one: services/ -> components/ is forbidden (that would invert the layer). Types/models shared with a component belong in services/ or a feature-level model/, not under components/. (We deliberately do NOT force components through a services/ pass-through: the feature stores are already service-shaped and display-components-cannot-dispatch already fences direct state-home mutation.) Spec/e2e/po exempt.",
        from: {
            path: "^app/codeCharta/features/[^/]+/services/",
            pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.po\\.ts$"]
        },
        to: { path: "^app/codeCharta/features/[^/]+/components/" }
    },
    {
        name: "feature-types-cannot-import-from-feature-internals",
        severity: "error",
        comment: "Features: types/ folder can only contain type definitions and cannot import from services, stores, or effects",
        from: { path: "^app/codeCharta/features/[^/]+/types/" },
        to: { path: "^app/codeCharta/features/[^/]+/(services|stores|effects)/" }
    },
    {
        name: "feature-no-circular-dependencies-between-features",
        severity: "error",
        comment:
            "Prevent circular dependencies BETWEEN features (cross-feature only; intra-feature cycles are covered by 'no-circular'). No exemption — the codeMap/viewCube grandfather was dropped in Slice 16c.",
        from: { path: "^app/codeCharta/features/([^/]+)/" },
        to: {
            path: "^app/codeCharta/features/([^/]+)/",
            pathNot: ["^app/codeCharta/features/$1/"],
            circular: true
        }
    },
    {
        name: "no-component-scss-files",
        severity: "error",
        comment:
            "Component SCSS is not allowed under app/codeCharta/; use daisyUI/Tailwind. Global styles live in app/app.scss + app/mixins.scss.",
        from: {},
        to: { path: "^app/codeCharta/.*\\.scss$" }
    },
    {
        name: "no-angular-material",
        severity: "error",
        comment: "Angular Material has been fully removed from the app, use DaisyUI instead",
        from: { path: "^app/codeCharta/", pathNot: "\\.spec\\.ts$" },
        to: { path: "@angular/(material|cdk)" }
    },
    {
        name: "feature-only-stores-can-import-ngrx-store",
        severity: "error",
        comment:
            "Only a feature's stores/, selectors/ and effects/ may import @ngrx/store. Components use services, services use stores; effects are ngrx state-reactors and legitimately touch the store.",
        from: {
            path: "^app/codeCharta/features/[^/]+/",
            pathNot: ["^app/codeCharta/features/[^/]+/(stores|selectors|effects)/", "\\.spec\\.ts$"]
        },
        to: { path: "@ngrx/store" }
    },
    {
        name: "wire-dto-only-in-filestore-boundary",
        severity: "error",
        comment:
            "codeCharta.api.model is the cc.json wire DTO — the data contract with the CLI. Only the fileStore ingestion boundary may depend on it: the load pipeline in stores/fileStore/loaders, gameObjects importer included. Keeping it out of rendering/state/UI/lenses means a cc.json format change (2.0) stays contained to the ingestion seam. The 2.0 domain types live in model/ccjson2.model.ts, which must NOT import api.model. Test/mocks/fixtures are exempt. NOTE: after the reorg the DTO lives at model/codeCharta.api.model.ts — this rule targets it by that EXACT path and must never be relaxed into a whole-model/ allow.",
        from: {
            pathNot: [
                "^app/codeCharta/stores/fileStore/",
                "^app/codeCharta/mocks/",
                "^app/codeCharta/resources/",
                "\\.spec\\.ts$",
                "\\.e2e\\.ts$",
                "\\.mocks\\.ts$"
            ]
        },
        to: { path: "^app/codeCharta/model/codeCharta\\.api\\.model\\.ts$" }
    }
]
