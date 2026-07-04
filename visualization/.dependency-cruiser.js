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
            comment:
                "Feature internals can only be accessed within the same feature. External code must use facade.ts, components/ or a feature's effects bundle (effects/<feature>.effects.ts) — the latter is the public ngrx-registration manifest imported by the app composition root (Slice 15c), which must NOT be routed through the facade (that would pull every effect's cross-feature deps into the facade graph and form cycles).",
            from: {
                pathNot: "^app/codeCharta/features/"
            },
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
                "Cross-feature imports must go through facade.ts or components/. Direct access to services, stores, selectors, model is forbidden. (Test files — .e2e/.po/.spec — are exempt: they compose features for integration wiring, e.g. a service spec registering another feature's effect in a test EffectsModule, mirroring how every migration boundary rule exempts specs; the runtime source stays fenced.)",
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
            comment:
                "Only a feature's stores/, selectors/ and effects/ may import @ngrx/store. Components use services, services use stores; effects are ngrx state-reactors (they own the createEffect streams) and legitimately touch the store, like a state-holder. The effects/ exemption was added in Slice 15c when the reactive side-effects moved from state/effects/ into their owning feature.",
            from: {
                path: "^app/codeCharta/features/[^/]+/",
                pathNot: ["^app/codeCharta/features/[^/]+/(stores|selectors|effects)/", "\\.spec\\.ts$"]
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

        /* ───────────── Visualization 2.0 — Slice 1 lens/fileStore boundary ─────────────
         * Scoped to the dirs that exist this slice (lenses/metrics, fileStore). The 7 lens-internal
         * rules + `metrics-lens-ngrx-guard` are now `error` (the guard flipped in Slice 11 once the
         * legend re-homed out of lenses/); `new-must-not-import-legacy` flipped to `error` in Slice 12
         * once the last 6 residual lenses/|fileStore/ → features/|state/ edges were re-homed.
         * See migration-2-0-plans/rpi-plan/step-1-skeleton-and-model.md. */
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
                pathNot: ["^app/codeCharta/lenses/[^/]+/[^/]+\\.facade\\.ts$", "^app/codeCharta/lenses/[^/]+/features/[^/]+/components/"]
            }
        },
        {
            name: "lens-internals-do-not-use-own-lens-facade",
            severity: "error",
            comment:
                "A lens's own code (its features/services/store/repos) reads the repos/store — never its own lens facade. That facade is the OUTWARD public API for code outside the lens; an inside consumer must not route back through it. Cross-lens access to ANOTHER lens's facade stays allowed (governed by lens-cross-lens-only-via-facade). The lens facade file itself and specs are exempt.",
            from: {
                path: "^app/codeCharta/lenses/([^/]+)/",
                pathNot: ["^app/codeCharta/lenses/[^/]+/[^/]+\\.facade\\.ts$", "\\.spec\\.ts$", "\\.e2e\\.ts$"]
            },
            to: { path: "^app/codeCharta/lenses/$1/[^/]+\\.facade\\.ts$" }
        },
        {
            name: "lens-feature-cross-only-via-public-api",
            severity: "error",
            comment:
                "Within a lens, a feature may reach another feature only via its facade.ts or components/ (not its services/stores/models).",
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
            comment:
                "Components take their data from services. A lens feature component may not import a repo or store directly — go via the feature's services.",
            from: { path: "^app/codeCharta/lenses/[^/]+/features/[^/]+/components/" },
            to: { path: ["^app/codeCharta/lenses/[^/]+/repos/", "^app/codeCharta/lenses/[^/]+/store/"] }
        },
        {
            name: "feature-services-read-repos-not-store",
            severity: "error",
            comment:
                "Services hold logic and read the repo. They must not reach the raw store directly — the repo is the data-access seam.",
            from: { path: "^app/codeCharta/lenses/[^/]+/features/[^/]+/services/" },
            to: { path: "^app/codeCharta/lenses/[^/]+/store/" }
        },
        {
            name: "filestore-has-no-upward-deps",
            severity: "error",
            comment:
                "FileStore is the source. It must not import lenses, renderers, shell, interaction or the mapState home. Spec/e2e files are exempt (they may reference a home's action creators for test wiring, mirroring new-must-not-import-legacy) — the runtime source stays clean.",
            from: { path: "^app/codeCharta/fileStore/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: {
                path: [
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/renderers/",
                    "^app/codeCharta/shell/",
                    "^app/codeCharta/interaction/",
                    "^app/codeCharta/mapState/"
                ]
            }
        },
        {
            name: "state-home-is-leaf",
            severity: "error",
            comment:
                "State-home modules — mapState is the map-view state home (colors, labels, scaling, axis inversion, edge visibility, plus the Slice-6 presentation stragglers colorMode/colorRange/margin/layoutAlgorithm and the transient interaction ids), sharedView is the cross-renderer view-state home (focus + search + blacklist + markedPackages), preferences is the durable global-preferences home (Slice 10) — are a leaf. They must not import lenses, renderers or shell; a lens/renderer/page reads the home facade, never the reverse. The home reads only the model/util kernel + its own store (legacy state/ stays a transitional read while the state/ split completes). Flipped to error for mapState in Slice 6, sharedView in Slice 8 and preferences in Slice 10b.",
            from: { path: ["^app/codeCharta/mapState/", "^app/codeCharta/sharedView/", "^app/codeCharta/preferences/"] },
            to: {
                path: ["^app/codeCharta/lenses/", "^app/codeCharta/renderers/", "^app/codeCharta/shell/"]
            }
        },
        {
            name: "state-home-only-stores-import-ngrx",
            severity: "error",
            comment:
                "Only a state-home's store/ folder may import @ngrx/store — the home's public facade is a barrel of re-exports and its consumers reach it through selectors/actions, never by importing ngrx from home code outside store/. Flipped to error for mapState in Slice 6, sharedView in Slice 8 and preferences in Slice 10b.",
            from: {
                path: ["^app/codeCharta/mapState/", "^app/codeCharta/sharedView/", "^app/codeCharta/preferences/"],
                pathNot: [
                    "^app/codeCharta/mapState/store/",
                    "^app/codeCharta/sharedView/store/",
                    "^app/codeCharta/preferences/store/",
                    "\\.spec\\.ts$"
                ]
            },
            to: { path: "@ngrx/store" }
        },
        {
            name: "metrics-lens-ngrx-guard",
            severity: "error",
            comment:
                "Lens code may import @ngrx/store only from a lens's repos/store. Enforced at error since Slice 11 re-homed the legend out of lenses/ — the last lens-code ngrx injection (legend.service) is gone, and the abandoned lenses/*/features/ 'shell' model no longer exists.",
            from: {
                path: "^app/codeCharta/lenses/",
                pathNot: ["^app/codeCharta/lenses/[^/]+/(repos|store)/", "\\.spec\\.ts$"]
            },
            to: { path: "@ngrx/store" }
        },
        {
            name: "load-orchestrator-not-imported-by-lower-layers",
            severity: "error",
            comment:
                "load/ is the initial-file load orchestrator (Slice 12b): on startup it hydrates state from a persisted/URL cc.json by driving the homes, lenses and fileStore through their public facades/actions. It is a TOP layer — nothing it writes into may import it back. Homes (mapState/sharedView/preferences), lenses, renderers and shell must not depend on load/ (that would invert the layering and risk a cycle, since load/ imports their facades). The fileStore ingestion boundary is the sole permitted importer: its loader kicks off the orchestrator (fileStore -> load/). A follow-up may move the loader itself into load/ to drop even that transitional edge.",
            from: {
                path: [
                    "^app/codeCharta/mapState/",
                    "^app/codeCharta/sharedView/",
                    "^app/codeCharta/preferences/",
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/renderers/",
                    "^app/codeCharta/shell/"
                ]
            },
            to: { path: "^app/codeCharta/load/" }
        },
        {
            name: "new-must-not-import-legacy",
            severity: "error",
            comment:
                "Layering boundary: the SOURCE/DATA layers (lenses/, fileStore/) must not import UP into features/. Originally this also fenced the legacy state/ folder, but Slice 15 fully dissolved state/ (its selectors → renderModel/, effects → features/load, root store → store/), so only the features/ fence remains (lenses/fileStore sit BELOW features and must not depend on them — no other rule covers this edge; filestore-has-no-upward-deps stops at lenses/mapState). util/ + model/ are the shared kernel and exempt. The reverse (features → lens facade) is the allowed flow. Spec/e2e are exempt (test wiring).",
            from: { path: "^app/codeCharta/(lenses|fileStore)/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: ["^app/codeCharta/features/"] }
        },
        {
            name: "lens-owns-ccjson-source",
            severity: "error",
            comment:
                "Slice 9a/14: the cc.json SOURCE the lenses own — the metrics lens's node attributeTypes/attributeDescriptors slices + their metricsLensSource root, and the dependency lens's edge attributeTypes slice + its dependencyLensSource root, all under lenses/*/store/ — is reached from outside the lens only through that lens's facade (the read facade for selectors, the load facade for the write actions + store wiring), never its store internals. Locks 'the cc.json source lives only under lenses' as the fileSettings root dissolves. Flipped warn→error post-Slice-13 (grep-verified 0 violations); Slice 14 re-homed the edge side out of the metrics lens into the dependency lens's own store and extended this rule to fence it too.",
            from: { path: "^app/codeCharta/", pathNot: ["^app/codeCharta/lenses/", "\\.spec\\.ts$", "\\.e2e\\.ts$", "\\.mocks\\.ts$"] },
            to: {
                path: [
                    "^app/codeCharta/lenses/metrics/store/attributeTypes/",
                    "^app/codeCharta/lenses/metrics/store/attributeDescriptors/",
                    "^app/codeCharta/lenses/metrics/store/metricsLensSource",
                    "^app/codeCharta/lenses/dependency/store/attributeTypes/",
                    "^app/codeCharta/lenses/dependency/store/dependencyLensSource"
                ]
            }
        },
        {
            name: "lens-no-view-state",
            severity: "error",
            comment:
                "A lens is data/projection, never a reader of mutable VIEW STATE. Lens code (lenses/**) must not import a state home — mapState (map-view settings + transient interaction ids), sharedView (focus/search/blacklist/markedPackages) or preferences — nor any view-state selector; selection/blacklist/edge-visibility reach a lens only as explicit parameters passed by the composing layer. Authored at error in Slice 14a: precondition grep-verified 0 violations across all 15 lens source files (Slice 7 lifted the metrics lens's blacklist/dynamicSettings reads, Slice 9b the dependency lens's blacklist/showEdges reads, into state/selectors). Freezes the 'lenses never read view state' invariant ahead of Slice 14's structure lens + renderer-agnostic id + valueOf(id), which must not re-couple a lens to a home. Spec/e2e exempt (test wiring).",
            from: { path: "^app/codeCharta/lenses/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: ["^app/codeCharta/mapState/", "^app/codeCharta/sharedView/", "^app/codeCharta/preferences/"] }
        },
        {
            name: "render-model-is-top-derived-layer",
            severity: "error",
            comment:
                "renderModel/ is the cross-lens composing layer (Slice 15): it folds the structure/metrics/dependency lenses + the view-state homes into the decorated tree and its derived read models (accumulatedData, codeMapNodes, pathToNode, rootUnary, metricData, the derived metric + node-resolving selectors, the render-availability gates). It sits ABOVE the lenses and homes — it reads their facades DOWNWARD — so nothing below it may import it back: lenses, fileStore (the source) and the three state homes (mapState/sharedView/preferences) must not depend on renderModel/. Consumers ABOVE it (features/, load/, state effects, renderers, app.config) reach every composing selector through renderModel.facade. Mirrors load-orchestrator-not-imported-by-lower-layers. Spec/e2e exempt (test wiring).",
            from: {
                path: [
                    "^app/codeCharta/lenses/",
                    "^app/codeCharta/fileStore/",
                    "^app/codeCharta/mapState/",
                    "^app/codeCharta/sharedView/",
                    "^app/codeCharta/preferences/"
                ],
                pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"]
            },
            to: { path: "^app/codeCharta/renderModel/" }
        },
        {
            name: "root-store-is-sole-composer",
            severity: "error",
            comment:
                "store/store.ts is the ngrx ROOT composition (Slice 15f): the per-home reducer map (appReducers) + the global setState meta-reducer. Only the app composition root (app/app.config.ts) may import it — nothing else re-composes or re-wires the store. The reusable root-state CONTRACT is deliberately kept OUT of this module so consumers never touch the composition: defaultState + the deep-merge kernel live in store/state.manager and the global setState action in store/state.actions, both freely importable. Spec/e2e are exempt (they wire a real store via StoreModule.forRoot(appReducers, ...) for integration tests).",
            from: { path: "^app/codeCharta/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: { path: "^app/codeCharta/store/store\\.ts$" }
        },

        /* ───────────── Visualization 2.0 — Slice 13 CQRS: read/write facade split ─────────────
         * Each state home's single public barrel splits into a READ facade (selectors + root selector +
         * default* fallbacks + store wiring) and a WRITE facade (action creators). A display-only
         * consumer physically cannot dispatch. Staged per home as each split lands (13a preferences,
         * 13b sharedView, 13c mapState) — the `to` patterns grow home-by-home and flip warn→error.
         * See migration-2-0-plans/slice-13-cqrs-homes.md. */
        {
            name: "state-home-write-facade-is-sole-dispatch-surface",
            severity: "error",
            comment:
                "A state home's action creators are reached from outside the home ONLY through its write facade (<home>.write.facade.ts), never the raw store/**/*.actions.ts files. The write facade is the sole dispatch surface; the read facade and default*/selectors carry no creator. Spec/e2e are exempt (test wiring may reference raw action creators). Scoped to preferences in Slice 13a; grows to sharedView (13b) and mapState (13c).",
            from: {
                path: "^app/codeCharta/",
                pathNot: [
                    "^app/codeCharta/preferences/",
                    "^app/codeCharta/sharedView/",
                    "^app/codeCharta/mapState/",
                    "\\.spec\\.ts$",
                    "\\.e2e\\.ts$"
                ]
            },
            to: {
                path: [
                    "^app/codeCharta/preferences/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/sharedView/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/mapState/store/.*\\.actions\\.ts$"
                ]
            }
        },
        {
            name: "state-home-read-facade-has-no-dispatch",
            severity: "error",
            comment:
                "A state home's READ facade (<home>.read.facade.ts) re-exports selectors, the root selector, default* fallbacks and the store wiring — but NO action creator. It must not import any of the home's store/**/*.actions.ts files, so importing the read facade can never hand a consumer a dispatch. Scoped to preferences in Slice 13a; grew to sharedView (13b) and mapState (13c) — all three homes now enforced.",
            from: {
                path: [
                    "^app/codeCharta/preferences/preferences\\.read\\.facade\\.ts$",
                    "^app/codeCharta/sharedView/sharedView\\.read\\.facade\\.ts$",
                    "^app/codeCharta/mapState/mapState\\.read\\.facade\\.ts$"
                ]
            },
            to: {
                path: [
                    "^app/codeCharta/preferences/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/sharedView/store/.*\\.actions\\.ts$",
                    "^app/codeCharta/mapState/store/.*\\.actions\\.ts$"
                ]
            }
        },
        {
            name: "display-components-cannot-dispatch",
            severity: "error",
            comment:
                "Display components (features/**/*.component.ts) render state and emit UI events; they never dispatch a state-home action. A component must not import a home write facade — it reads via a selector/feature-store and delegates writes to its feature's store service. Already 0 violations. Scoped to preferences in Slice 13a; grew to sharedView (13b) and mapState (13c) — all three homes now enforced.",
            from: { path: "^app/codeCharta/features/.*\\.component\\.ts$", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
            to: {
                path: [
                    "^app/codeCharta/preferences/preferences\\.write\\.facade\\.ts$",
                    "^app/codeCharta/sharedView/sharedView\\.write\\.facade\\.ts$",
                    "^app/codeCharta/mapState/mapState\\.write\\.facade\\.ts$"
                ]
            }
        },
        {
            name: "feature-reaches-state-home-only-via-facade",
            severity: "error",
            comment:
                "Outside code reaches a state home only through its public facades (read/write), never its store/ internals — no raw import of a home's store/**/*.{selector,reducer,actions}. Scoped to sharedView + preferences (grep-verified 0 external raw store importers post-Slice-13; state.manager/appliers already route through the read/write facades, so no exemption is needed). mapState is deliberately EXCLUDED for now — it still has ~12 raw store/*.selector imports that fold onto MapStateReadWindow / the read facade in the CF #9 read-window dedup; mapState joins this rule once those clear. The home's own facades + store/ are exempt (from.pathNot); spec/e2e may wire raw for tests.",
            from: {
                path: "^app/codeCharta/",
                pathNot: ["^app/codeCharta/sharedView/", "^app/codeCharta/preferences/", "\\.spec\\.ts$", "\\.e2e\\.ts$"]
            },
            to: {
                path: ["^app/codeCharta/sharedView/store/", "^app/codeCharta/preferences/store/"]
            }
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
