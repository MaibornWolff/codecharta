/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: "no-circular",
            severity: "error",
            comment: "Prevent circular dependencies between modules. The graph is acyclic (Slice 16h). Unchanged by the reorg — it is path-agnostic.",
            from: {},
            to: { circular: true }
        },
        {
            name: "no-orphans",
            severity: "info",
            comment: "Warn about orphan modules (files not imported anywhere)",
            from: {
                orphan: true,
                pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.d\\.ts$", "(^|/)\\.[^/]+\\.[jt]s$", "app/main\\.ts$", "conf/", "script/"]
            },
            to: {}
        },

        /* ─────────────────────────── NEW — the view/page top layer ─────────────────────────── */
        {
            name: "nothing-imports-views",
            severity: "error",
            comment:
                "views/ is the TOP layer — routes + page composition (the CodeCharta page today; Graph/Report later). It composes features and owns no logic, so NOTHING inside app/codeCharta/ may import it back. Only the Angular bootstrap (app/app.config.ts, app/main.ts — outside codeCharta/) mounts the page. Spec/e2e exempt (test harness may mount a page). NEW rule: the flat tree had no view layer to fence.",
            from: { path: "^app/codeCharta/", pathNot: ["^app/codeCharta/views/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: "^app/codeCharta/views/" }
        },

        {
            name: "feature-no-external-access-to-internals",
            severity: "error",
            comment:
                "Feature internals can only be accessed within the same feature. External code (now including views/) must use facade.ts, components/ or a feature's effects bundle (effects/<feature>.effects.ts) — the latter is the public ngrx-registration manifest imported by the app composition root, which must NOT be routed through the facade (that would pull every effect's cross-feature deps into the facade graph and form cycles).",
            from: { pathNot: "^app/codeCharta/features/" },
            to: {
                path: "^app/codeCharta/features/",
                pathNot: [
                    "^app/codeCharta/features/[^/]+/(components/|facade\\.ts$)",
                    "^app/codeCharta/features/[^/]+/effects/[^/]+\\.effects\\.ts$"
                ]
            }
        },
        {
            name: "feature-cross-feature-only-via-public-api",
            severity: "error",
            comment:
                "Cross-feature imports must go through facade.ts or components/. Direct access to services, stores, selectors, model is forbidden. (Test files — .e2e/.po/.spec — are exempt.)",
            from: {
                path: "^app/codeCharta/features/([^/]+)/",
                pathNot: ["\\.e2e\\.ts$", "\\.po\\.ts$", "\\.spec\\.ts$"]
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
            from: { path: "^app/codeCharta/features/[^/]+/types/" },
            to: { path: "^app/codeCharta/features/[^/]+/(services|stores|effects)/" }
        },
        {
            name: "feature-no-circular-dependencies-between-features",
            severity: "error",
            comment: "Prevent circular dependencies BETWEEN features (cross-feature only; intra-feature cycles are covered by 'no-circular'). No exemption — the codeMap/viewCube grandfather was dropped in Slice 16c.",
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
            comment: "Component SCSS is not allowed under app/codeCharta/; use daisyUI/Tailwind. Global styles live in app/app.scss + app/mixins.scss.",
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
                "codeCharta.api.model is the cc.json wire DTO — the data contract with the CLI. Only the fileStore ingestion boundary may depend on it: the moved load pipeline (stores/fileStore/loaders), the navBar gameObjects importer, and util/fileDownloader (export). Keeping it out of rendering/state/UI/lenses means a cc.json format change (2.0) stays contained to the ingestion seam. The 2.0 domain types live in model/ccjson2.model.ts, which must NOT import api.model. Test/mocks/fixtures are exempt. NOTE: after the reorg the DTO lives at model/codeCharta.api.model.ts — this rule targets it by that EXACT path and must never be relaxed into a whole-model/ allow.",
            from: {
                pathNot: [
                    "^app/codeCharta/stores/fileStore/",
                    "^app/codeCharta/features/navBar/util/gameObjectsParser/",
                    "^app/codeCharta/util/fileDownloader\\.ts$",
                    "^app/codeCharta/mocks/",
                    "^app/codeCharta/resources/",
                    "\\.spec\\.ts$",
                    "\\.e2e\\.ts$",
                    "\\.mocks\\.ts$"
                ]
            },
            to: { path: "^app/codeCharta/model/codeCharta\\.api\\.model\\.ts$" }
        },

        /* ───────────────────────────────── lenses (read-only projection) ───────────────────────────────── */
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
            comment: "Outside code may touch a lens only through its public surface: the lens facade (for data). Never its services, repos, stores or models.",
            from: { pathNot: "^app/codeCharta/lenses/" },
            to: {
                path: "^app/codeCharta/lenses/",
                pathNot: ["^app/codeCharta/lenses/[^/]+/[^/]+\\.facade\\.ts$"]
            }
        },
        {
            name: "lens-internals-do-not-use-own-lens-facade",
            severity: "error",
            comment:
                "A lens's own code reads the repos/store — never its own lens facade (that facade is the OUTWARD public API). Cross-lens access to ANOTHER lens's facade stays allowed. The lens facade file itself and specs are exempt.",
            from: {
                path: "^app/codeCharta/lenses/([^/]+)/",
                pathNot: ["^app/codeCharta/lenses/[^/]+/[^/]+\\.facade\\.ts$", "\\.spec\\.ts$", "\\.e2e\\.ts$"]
            },
            to: { path: "^app/codeCharta/lenses/$1/[^/]+\\.facade\\.ts$" }
        },
        {
            name: "metrics-lens-ngrx-guard",
            severity: "error",
            comment: "Lens code may import @ngrx/store only from a lens's repos/store.",
            from: {
                path: "^app/codeCharta/lenses/",
                pathNot: ["^app/codeCharta/lenses/[^/]+/(repos|store)/", "\\.spec\\.ts$"]
            },
            to: { path: "@ngrx/store" }
        },
        {
            name: "stores-own-ccjson-source",
            severity: "error",
            comment:
                "The cc.json SOURCE state now lives in stores/ (Slice 19b moved it OUT of the lenses so the ngrx composition root store/ no longer imports lenses/): the metricsLensSource home (node attributeTypes + attributeDescriptors + the metricsLensSource root reducer/selector) and the dependencyLensSource home (edge attributeTypes + the dependencyLensSource root). Its ngrx store/ internals are reached from outside the owning home ONLY through that home's read/write facade — so the composition root (store/), the load pipeline (load/) and the now-pure-projection lenses all go through the facades, never store/ internals. Replaces the old lens-owns-ccjson-source rule (the source is no longer lens-owned). Spec/e2e/mocks exempt.",
            from: {
                path: "^app/codeCharta/",
                pathNot: [
                    "^app/codeCharta/stores/metricsLensSource/",
                    "^app/codeCharta/stores/dependencyLensSource/",
                    "\\.spec\\.ts$",
                    "\\.e2e\\.ts$",
                    "\\.mocks\\.ts$"
                ]
            },
            to: {
                path: [
                    "^app/codeCharta/stores/metricsLensSource/store/",
                    "^app/codeCharta/stores/dependencyLensSource/store/"
                ]
            }
        },
        {
            name: "lens-no-view-state",
            severity: "error",
            comment:
                "A lens is data/projection, never a reader of mutable VIEW STATE. Lens code (lenses/**) must not import a state home — stores/mapState, stores/sharedView or stores/preferences — nor any view-state selector; selection/blacklist/edge-visibility reach a lens only as explicit parameters passed by the composing layer (renderModel). This half of the lens‖home fence is why 'Lenses above Stores' is a readability order, not a real edge. Spec/e2e exempt.",
            from: { path: "^app/codeCharta/lenses/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: ["^app/codeCharta/stores/mapState/", "^app/codeCharta/stores/sharedView/", "^app/codeCharta/stores/preferences/"] }
        },

        /* ───────────────────────────────── stores (state homes + the source) ───────────────────────────────── */
        {
            name: "filestore-has-no-upward-deps",
            severity: "error",
            comment:
                "FileStore is the source: it sits below every view layer. It must not import lenses or any state home (stores/mapState, stores/sharedView, stores/preferences) so ingestion cannot read back the state they own. Spec/e2e exempt.",
            from: { path: "^app/codeCharta/stores/fileStore/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: {
                path: [
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/stores/mapState/",
                    "^app/codeCharta/stores/sharedView/",
                    "^app/codeCharta/stores/preferences/"
                ]
            }
        },
        {
            name: "state-home-is-leaf",
            severity: "error",
            comment:
                "State-home modules — stores/mapState (map-view presentation + metric selection + transient interaction ids), stores/sharedView (focus + search + blacklist + markedPackages), stores/preferences (durable global prefs) — are leaves. They must not import lenses; a lens/renderer/page reads the home facade, never the reverse. The home reads only the model/util kernel + its own store.",
            from: { path: ["^app/codeCharta/stores/mapState/", "^app/codeCharta/stores/sharedView/", "^app/codeCharta/stores/preferences/", "^app/codeCharta/stores/metricsLensSource/", "^app/codeCharta/stores/dependencyLensSource/"] },
            to: { path: ["^app/codeCharta/lenses/"] }
        },
        {
            name: "state-home-only-stores-import-ngrx",
            severity: "error",
            comment: "Only a state-home's store/ folder may import @ngrx/store — consumers reach the home through its facades, never by importing ngrx from home code outside store/.",
            from: {
                path: ["^app/codeCharta/stores/mapState/", "^app/codeCharta/stores/sharedView/", "^app/codeCharta/stores/preferences/", "^app/codeCharta/stores/metricsLensSource/", "^app/codeCharta/stores/dependencyLensSource/"],
                pathNot: [
                    "^app/codeCharta/stores/mapState/store/",
                    "^app/codeCharta/stores/sharedView/store/",
                    "^app/codeCharta/stores/preferences/store/",
                    "^app/codeCharta/stores/metricsLensSource/store/",
                    "^app/codeCharta/stores/dependencyLensSource/store/",
                    "\\.spec\\.ts$"
                ]
            },
            to: { path: "@ngrx/store" }
        },
        {
            name: "feature-reaches-state-home-only-via-facade",
            severity: "error",
            comment:
                "Outside code reaches a state home only through its public facades (read/write), never its store/ internals — no raw import of a home's store/**/*.{selector,reducer,actions}. All three homes fenced. The homes' own facades + store/ are exempt (from.pathNot); spec/e2e may wire raw for tests.",
            from: {
                path: "^app/codeCharta/",
                pathNot: [
                    "^app/codeCharta/stores/sharedView/",
                    "^app/codeCharta/stores/preferences/",
                    "^app/codeCharta/stores/mapState/",
                    "\\.spec\\.ts$",
                    "\\.e2e\\.ts$"
                ]
            },
            to: {
                path: [
                    "^app/codeCharta/stores/sharedView/store/",
                    "^app/codeCharta/stores/preferences/store/",
                    "^app/codeCharta/stores/mapState/store/"
                ]
            }
        },

        /* ─────────────── CQRS read/write facade split on the homes (Slice 13) ─────────────── */
        {
            name: "state-home-write-facade-is-sole-dispatch-surface",
            severity: "error",
            comment:
                "A state home's action creators are reached from outside the home ONLY through its write facade (<home>.write.facade.ts), never the raw store/**/*.actions.ts files. Spec/e2e exempt.",
            from: {
                path: "^app/codeCharta/",
                pathNot: [
                    "^app/codeCharta/stores/preferences/",
                    "^app/codeCharta/stores/sharedView/",
                    "^app/codeCharta/stores/mapState/",
                    "\\.spec\\.ts$",
                    "\\.e2e\\.ts$"
                ]
            },
            to: {
                path: [
                    "^app/codeCharta/stores/preferences/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/stores/sharedView/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/stores/mapState/store/.*\\.actions\\.ts$"
                ]
            }
        },
        {
            name: "state-home-read-facade-has-no-dispatch",
            severity: "error",
            comment:
                "A state home's READ facade (<home>.read.facade.ts) re-exports selectors/root/default*/store-wiring — but NO action creator; it must not import any store/**/*.actions.ts, so importing the read facade can never hand a consumer a dispatch.",
            from: {
                path: [
                    "^app/codeCharta/stores/preferences/preferences\\.read\\.facade\\.ts$",
                    "^app/codeCharta/stores/sharedView/sharedView\\.read\\.facade\\.ts$",
                    "^app/codeCharta/stores/mapState/mapState\\.read\\.facade\\.ts$"
                ]
            },
            to: {
                path: [
                    "^app/codeCharta/stores/preferences/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/stores/sharedView/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/stores/mapState/store/.*\\.actions\\.ts$"
                ]
            }
        },
        {
            name: "display-components-cannot-dispatch",
            severity: "error",
            comment:
                "Display components (features/**/*.component.ts) render state and emit UI events; they never dispatch a state-home action. A component must not import a home write facade — it reads via a selector/feature-store and delegates writes to its feature's store service.",
            from: { path: "^app/codeCharta/features/.*\\.component\\.ts$", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: {
                path: [
                    "^app/codeCharta/stores/preferences/preferences\\.write\\.facade\\.ts$",
                    "^app/codeCharta/stores/sharedView/sharedView\\.write\\.facade\\.ts$",
                    "^app/codeCharta/stores/mapState/mapState\\.write\\.facade\\.ts$"
                ]
            }
        },

        /* ───────────────────────────────── renderer (engine + derived read-model) ───────────────────────────────── */
        {
            name: "render-model-is-top-derived",
            severity: "error",
            comment:
                "renderer/renderModel/ is the cross-lens composing layer: it folds the structure/metrics/dependency lenses + the view-state homes into the decorated tree and its derived read models. It sits ABOVE the lenses and homes — it reads their facades DOWNWARD — so nothing below it may import it back: lenses, stores/fileStore (the source) and the three state homes (stores/mapState, stores/sharedView, stores/preferences) must not depend on it. Consumers ABOVE it (features/, views/, load/, the renderer engine) reach every composing selector through renderModel.facade. Spec/e2e exempt.",
            from: {
                path: [
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/stores/fileStore/",
                    "^app/codeCharta/stores/mapState/",
                    "^app/codeCharta/stores/sharedView/",
                    "^app/codeCharta/stores/preferences/",
                    "^app/codeCharta/stores/metricsLensSource/",
                    "^app/codeCharta/stores/dependencyLensSource/"
                ],
                pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"]
            },
            to: { path: "^app/codeCharta/renderer/renderModel/" }
        },
        {
            name: "render-model-external-access-only-via-facade",
            severity: "error",
            comment:
                "Outside code reaches the renderModel composing layer only through its public surface — renderModel.facade.ts — never its internal selector modules (accumulatedData/, nodeMetricData/, edgeMetricData/, searchedNodes/, primaryMetrics/, allNecessaryRenderDataAvailable/, amountOfBuildingsWithSelectedEdgeMetric/, and the root-level *.selector.ts). The facade is the single barrel every consumer (features/, load/, effects, the renderer engine) imports; the internal selector modules import each other directly, so the layer's OWN files are exempt (from.pathNot); spec/e2e may reach internals for white-box testing / jest.spyOn. Companion to render-model-is-top-derived, which fences DIRECTION only (nothing below may import renderModel) — this rule fences the SURFACE (above may import it, but only via the facade). Mirrors lens-external-access-only-via-public-surface + feature-reaches-state-home-only-via-facade.",
            from: { path: "^app/codeCharta/", pathNot: ["^app/codeCharta/renderer/renderModel/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: {
                path: "^app/codeCharta/renderer/renderModel/",
                pathNot: ["^app/codeCharta/renderer/renderModel/renderModel\\.facade\\.ts$"]
            }
        },
        {
            name: "renderer-does-not-import-up",
            severity: "error",
            comment:
                "renderer/ is the render tier: the Three.js engine (renderer/threeViewer/ — scene/camera/controls/renderer, the codeMap mesh + treemap/street layout ALGORITHM, the scene stores) plus the derived read-model (renderer/renderModel/). It sits BELOW the features/ that drive it and the views/ that host them. Everything it needs it reads DOWNWARD through public facades (renderModel.facade, the lens facades, the mapState/sharedView home facades, fileStore.facade). The UPWARD edge is forbidden: the renderer must NOT import features/, views/ or load/ (the startup orchestrator) — that would invert the layering and risk a cycle. Renamed + widened from `three-viewer-engine-does-not-import-up` (now covers renderModel too). Spec/e2e exempt.",
            from: { path: "^app/codeCharta/renderer/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: ["^app/codeCharta/features/", "^app/codeCharta/views/", "^app/codeCharta/load/"] }
        },

        /* ───────────────────────────────── util — the leaf kernel ───────────────────────────────── */
        {
            name: "util-is-a-leaf-kernel",
            severity: "error",
            comment:
                "util/ is the shared LEAF kernel: pure, self-contained helpers that OTHER layers consume — never the reverse. It may import only within util/, the model/ type kernel (incl. the codeCharta.model re-export barrel + the api.model wire DTO, both now under model/) and node_modules; it must NOT reach into any app layer (views/features/renderer/lenses/stores). Positive allow-list: anything under app/codeCharta/ that is NOT util/ or model/ is forbidden, so any future layer is auto-fenced. Spec/e2e/mocks exempt.",
            from: { path: "^app/codeCharta/util/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.mocks\\.ts$"] },
            to: {
                path: "^app/codeCharta/",
                pathNot: ["^app/codeCharta/util/", "^app/codeCharta/model/"]
            }
        },

        /* ───────────────────── PARKED — composition-root shard (load/) ─────────────────────
         * the ngrx composition root was nested under stores/ as stores/rootStore/ (Slice 19c/19d — it
         * composes the home stores + depends only on stores/util/model, so it lives in the same band).
         * load/ (the initial-file orchestrator) is
         * still top-level and unplaced (see TARGET-ARCHITECTURE.md "Open questions"); revisit when it
         * gets a home (likely an `app-root` band above views/). */
        {
            name: "load-orchestrator-not-imported-by-lower-layers",
            severity: "error",
            comment:
                "load/ is the initial-file load orchestrator: on startup it hydrates state from a persisted/URL cc.json by driving the homes, lenses and fileStore through their public facades/actions. It is a TOP layer — nothing it writes into may import it back. Homes (stores/mapState, stores/sharedView, stores/preferences), lenses AND stores/fileStore must not depend on load/. renderer's own upward edges to load/ are fenced by renderer-does-not-import-up. Spec/e2e exempt. PARKED path.",
            from: {
                path: [
                    "^app/codeCharta/stores/mapState/",
                    "^app/codeCharta/stores/sharedView/",
                    "^app/codeCharta/stores/preferences/",
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/stores/fileStore/",
                    "^app/codeCharta/stores/metricsLensSource/",
                    "^app/codeCharta/stores/dependencyLensSource/"
                ],
                pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"]
            },
            to: { path: "^app/codeCharta/load/" }
        },
        {
            name: "load-external-access-only-via-facade",
            severity: "error",
            comment:
                "Outside code reaches the load/ orchestration layer only through its public surface: load.facade.ts (the initial-file loader) — never its service (loadInitialFile.service), its store (loadInitialFile.store) or an individual effect. The single exception is the ngrx effects-registration manifest load/effects/load.effects.ts (the loadEffects array), which the app composition root (app.config.ts) imports directly; routing that manifest through the facade would pull every effect's cross-feature deps into the facade graph and risk cycles. Spec/e2e exempt. Twin of lens-external-access-only-via-public-surface and feature-reaches-state-home-only-via-facade. Complements load-orchestrator-not-imported-by-lower-layers (that one governs DIRECTION/upward edges; this one governs the ENTRY POINT).",
            from: { path: "^app/codeCharta/", pathNot: ["^app/codeCharta/load/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: {
                path: "^app/codeCharta/load/",
                pathNot: ["^app/codeCharta/load/load\\.facade\\.ts$", "^app/codeCharta/load/effects/load\\.effects\\.ts$"]
            }
        },
        {
            name: "source-layers-must-not-import-features",
            severity: "error",
            comment:
                "Layering boundary: the SOURCE/DATA layers (lenses/, stores/fileStore/) must not import UP into features/. util/ + model/ are the shared kernel and exempt. The reverse (features → lens facade) is the allowed flow. Spec/e2e exempt.",
            from: { path: ["^app/codeCharta/lenses/", "^app/codeCharta/stores/fileStore/", "^app/codeCharta/stores/metricsLensSource/", "^app/codeCharta/stores/dependencyLensSource/"], pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: ["^app/codeCharta/features/"] }
        },
        {
            name: "root-store-is-sole-composer",
            severity: "error",
            comment:
                "stores/rootStore/store.ts is the ngrx ROOT composition: the per-home reducer map (appReducers) + the global setState meta-reducer. Only the app composition root (app/app.config.ts) may import it. The reusable root-state CONTRACT (defaultState + deep-merge kernel in stores/rootStore/state.manager, the global setState action in stores/rootStore/state.actions) is deliberately kept OUT of this module so consumers never touch the composition. Spec/e2e exempt. Slice 19c nested the composition root under stores/ (it composes the home stores + depends only on stores/util/model, so it lives in the same band); 19d named it rootStore/ — the root store that composes the home stores.",
            from: { path: "^app/codeCharta/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: "^app/codeCharta/stores/rootStore/store\\.ts$" }
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
