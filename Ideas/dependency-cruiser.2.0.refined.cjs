/**
 * CodeCharta 2.0 — dependency-cruiser rules for the REFINED layers & state-homes architecture.
 *
 * Source of truth: Ideas/codecharta-2.0-refined-layers-and-state-homes.html (ratified 2026-07-02).
 * This SUPERSEDES the stale Ideas/dependency-cruiser.2.0.cjs, which encoded the abandoned
 * "features-inside-lenses + shell" model. It is a drop-in evolution of visualization/.dependency-cruiser.js.
 *
 * The model it fences:
 *   pages/  ─ compose features (a screen; owns no logic)
 *   features/  ─ ONE flat top-level layer of components + services. A feature reads lens facades
 *                (data) and mutates ONLY through a state-home write facade. The old "shell" is GONE.
 *   lenses/  ─ read-only projections of cc.json (metrics · dependency · later structure). A lens
 *              NEVER owns mutable view state and never reads a selection; it is parameterized
 *              (metrics.rangeOf(metric)). Public surface = its READ facade (+ a near-empty, file-load-
 *              only WRITE/load facade). Only its repos/store touch ngrx.
 *   STATE HOMES (each ngrx slice lives in exactly one, carved by lifetime):
 *     mapState     ─ the CodeMap renderer's OWN presentation + its OWN metric selection (seeded by
 *                    today's appearance/). A future Graph gets a sibling graphState.
 *     sharedView   ─ the one value synced across every renderer (focus · selection · search · blacklist
 *                    · markedPackages).
 *     preferences  ─ durable global prefs -> localStorage.
 *     Homes are LEAVES and split read (selectors, dispatch-free) vs write (the sole dispatch surface).
 *   fileStore/  ─ raw files + selection/delta; the wire-DTO (codeCharta.api.model) is confined here.
 *   renderers/  ─ dumb engines behind a NAMED contract (load·highlight·settings + onSelect·onHover);
 *                 DEFERRED until renderer #2 (Graph LSM) lands.
 *
 * Allowed dependency direction (a layer imports only downward):
 *   pages ▶ features ▶ { lens READ facades · state-home read/write facades · renderer engine facade }
 *          ▶ lens repos ▶ lens store ▶ fileStore ▶ model/util
 *
 * STAGING (continues the 4 completed slices on feature/cc-json-2-analysis):
 *   S5  features-out-of-lenses  : git mv lenses/metrics/features/legend -> features/legend; drop the
 *                                 lens-internal-feature exceptions & rules.
 *   S6  keystone                : appearance/ -> mapState/ with its OWN reducer root (state.mapState.*
 *                                 real at runtime, no longer combined under appSettings).
 *   S7  mapState consolidation  : colorMode·colorRange·margin·layoutAlgorithm + the map's metric
 *                                 selection out of dynamicSettings; hover·rightClick·selectedBuilding·
 *                                 isLoadingMap out of appStatus -> mapState; split mapState read/write
 *                                 facade; parameterize the lenses (rangeOf) -> lenses stop reading view
 *                                 state & the lens ngrx guard flips.
 *   S8  sharedView              : stand up sharedView (focusedNodePath·searchPattern·blacklist·
 *                                 markedPackages·selected-node id); read/write facade.
 *   S9  fileSettings dissolves  : source (edges·attributeTypes·descriptors) -> lenses; filters ->
 *                                 sharedView.
 *   S10 preferences             : purge appSettings -> preferences; state/ is empty and removed; the
 *                                 migration rule and the last transitional aliases drop out.
 *   S11 renderer #2             : Graph LSM lands the renderers/ tree -> the deferred renderer-seam
 *                                 rules flip to error; structure lens; renderer-agnostic node id; graphState.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */

const APP = "^app/codeCharta"
const NGRX = "@ngrx/store"
const SPEC = "\\.spec\\.ts$"
const E2E = "\\.e2e\\.ts$"
const PO = "\\.po\\.ts$"

// ── layer roots ──
const LENSES = `${APP}/lenses/`
const FEATURES = `${APP}/features/`
const FILESTORE = `${APP}/fileStore/`
const RENDERERS = `${APP}/renderers/`
const PAGES = `${APP}/pages/`
const LEGACY_STATE = `${APP}/state/`

// State homes are named for the END state. `appearance` is the pre-rename SEED of mapState and rides
// in the transitional (`_T`) globs until the S6 keystone renames appearance/ -> mapState/; remove it then.
const HOMES = "(mapState|sharedView|preferences)"
const HOMES_T = "(mapState|sharedView|preferences|appearance)"
const HOME_ROOT = `${APP}/${HOMES}/`
const HOME_ROOT_T = `${APP}/${HOMES_T}/`
const NEW_LAYERS = `${APP}/(lenses|fileStore|${HOMES_T.slice(1, -1)})/`

// ── public surfaces (the only import targets outsiders may use) ──
const LENS_READ_FACADE = `${APP}/lenses/[^/]+/[^/]+Lens\\.facade\\.ts$` // metricsLens.facade.ts · dependencyLens.facade.ts
const LENS_LOAD_FACADE = `${APP}/lenses/[^/]+/[^/]+\\.load\\.facade\\.ts$` // additive, file-load-only write surface
const HOME_READ_FACADE = `${APP}/${HOMES}/[^/]+\\.read\\.facade\\.ts$`
const HOME_WRITE_FACADE = `${APP}/${HOMES}/[^/]+\\.write\\.facade\\.ts$`
const HOME_ACTIONS = `${APP}/${HOMES}/store/.*\\.actions\\.ts$`

// ── where a lens LOAD facade may legitimately be seeded from (the file-load pipeline) ──
const LOAD_PIPELINE = [`${APP}/fileStore/loaders/`, `${APP}/state/loadInitialFile/`, `${APP}/${HOMES}/loadInitialFile/`]

// ── feature sub-roles ──
const FEATURE_COMPONENTS = [`${APP}/features/[^/]+/.*\\.component\\.ts$`, `${APP}/features/[^/]+/components/`]
const FEATURE_STORES = `${APP}/features/[^/]+/(stores|selectors)/`

module.exports = {
    forbidden: [
        /* ───────────────────────── GLOBAL HYGIENE ───────────────────────── */
        {
            name: "no-circular",
            severity: "warn",
            comment: "Prevent circular dependencies between modules (warn until existing violations are fixed).",
            from: {},
            to: { circular: true }
        },
        {
            name: "no-orphans",
            severity: "info",
            comment: "Warn about orphan modules (files not imported anywhere).",
            from: {
                orphan: true,
                pathNot: [SPEC, E2E, "(^|/)\\.[^/]+\\.[jt]s$", "app/main\\.ts$", "conf/", "script/"]
            },
            to: {}
        },

        /* ───────────────────────── CROSS-CUTTING BANS (carried, permanent) ───────────────────────── */
        {
            name: "no-component-scss-files",
            severity: "error",
            comment: "Component SCSS is banned under app/codeCharta/; use daisyUI/Tailwind. Global styles live in app/app.scss + app/mixins.scss.",
            from: {},
            to: { path: `${APP}/.*\\.scss$` }
        },
        {
            name: "no-angular-material",
            severity: "error",
            comment: "Angular Material has been removed from the app; use DaisyUI instead.",
            from: { path: `${APP}/`, pathNot: SPEC },
            to: { path: "@angular/(material|cdk)" }
        },
        {
            name: "wire-dto-only-in-filestore-boundary",
            severity: "error",
            comment:
                "codeCharta.api.model is the cc.json wire DTO (the CLI contract). Only the fileStore ingestion boundary — the loaders, the navBar gameObjects importer, and util/fileDownloader (export) — may depend on it, so a cc.json (2.0) format change stays contained to the seam. The 2.0 domain types (model/ccjson2.model.ts) must NOT import api.model. Test/mocks/fixtures exempt.",
            from: {
                pathNot: [
                    FILESTORE,
                    `${APP}/features/navBar/util/gameObjectsParser/`,
                    `${APP}/util/fileDownloader\\.ts$`,
                    `${APP}/mocks/`,
                    `${APP}/resources/`,
                    SPEC,
                    E2E,
                    "\\.mocks\\.ts$"
                ]
            },
            to: { path: `${APP}/codeCharta\\.api\\.model\\.ts$` }
        },

        /* ───────────────────────── LENSES — read-only cc.json data ─────────────────────────
         * A lens must NOT import renderers/pages/features/state-homes; it is reached only via its READ
         * facade (+ a file-load-only WRITE/load facade); only its repos/store touch ngrx. */
        {
            name: "lens-no-renderer-or-page",
            severity: "error",
            comment: "A lens is data — it never depends on a UI renderer or the page that shows it. (Inert today: no renderers/ or pages/ tree yet.)",
            from: { path: LENSES },
            to: { path: [RENDERERS, PAGES] }
        },
        {
            name: "lens-no-feature",
            severity: "warn",
            comment:
                "A lens must not import the feature layer above it (leaf direction). STAGING: warn — lenses/metrics/features/legend is still nested and legend + lens selectors reach features transitionally; flips to ERROR in S5 once legend is re-homed to features/ and those edges are cut.",
            from: { path: LENSES, pathNot: [SPEC, E2E] },
            to: { path: FEATURES }
        },
        {
            name: "lens-no-view-state",
            severity: "warn",
            comment:
                "A lens is read-only cc.json data — it must NOT read mutable view state (mapState/sharedView/preferences, incl. the appearance seed). Selection is a PARAMETER supplied by the feature (rangeOf(metric)), never read by the lens. STAGING: warn — metrics/dependency lens selectors still read appearance/state transitionally; flips to ERROR in S7 when the lenses are parameterized and mapState owns selection (this is the flip that dissolves the deferred valueOf cycle).",
            from: { path: LENSES, pathNot: [SPEC] },
            to: { path: HOME_ROOT_T }
        },
        {
            name: "lens-cross-lens-only-via-read-facade",
            severity: "error",
            comment: "One lens may reach another lens only through that lens's READ facade (never its repos/store/model, and never its load facade — a lens does not seed another lens).",
            from: { path: `${APP}/lenses/([^/]+)/` },
            to: { path: `${APP}/lenses/([^/]+)/`, pathNot: [`${APP}/lenses/$1/`, LENS_READ_FACADE] }
        },
        {
            name: "lens-external-access-only-via-public-surface",
            severity: "error",
            comment:
                "Outside code (pages, features, other lenses' consumers) may touch a lens only through its public surface: the READ facade (data) or — only from the file-load pipeline, see next rule — the LOAD facade. Never services/repos/stores/models. STAGING: TARGET is facade-only. Until S5 re-homes lenses/metrics/features/legend, keep an interim exception `^app/codeCharta/lenses/[^/]+/features/[^/]+/components/` in this `pathNot`; delete it (and this note) in S5.",
            from: { pathNot: LENSES },
            to: { path: LENSES, pathNot: [LENS_READ_FACADE, LENS_LOAD_FACADE] }
        },
        {
            name: "lens-load-facade-only-for-file-load",
            severity: "warn",
            comment:
                "The lens WRITE surface is a near-empty, additive LOAD facade whose only job is file-load seeding — it may be imported ONLY by the file-load pipeline (fileStore/loaders + the loadInitialFile applier). Features/pages/components read the lens; they never seed it. STAGING: warn while the load facades are still being carved; flips to ERROR in S7 (and S9 for the source-into-lens move) once seeding is centralized.",
            from: { pathNot: [LENSES, ...LOAD_PIPELINE, SPEC] },
            to: { path: LENS_LOAD_FACADE }
        },
        {
            name: "lens-internals-do-not-use-own-lens-facade",
            severity: "error",
            comment:
                "A lens's own code reads its repos/store — never its own facade. The facade is the OUTWARD public API; an inside consumer routing back through it inverts the seam. Cross-lens access to ANOTHER lens's facade stays allowed (lens-cross-lens-only-via-read-facade). The facade files and specs are exempt.",
            from: { path: `${APP}/lenses/([^/]+)/`, pathNot: [LENS_READ_FACADE, LENS_LOAD_FACADE, SPEC, E2E] },
            to: { path: `${APP}/lenses/$1/[^/]+\\.facade\\.ts$` }
        },
        {
            name: "lens-only-repos-store-import-ngrx-store",
            severity: "warn",
            comment:
                "Within a lens, only repos/store may import @ngrx/store (createSelector/createFeatureSelector). Evolved from `metrics-lens-ngrx-guard`; the old `lenses/[^/]+/features/[^/]+/(stores|selectors)` exemption is dropped since lens-internal features go away in S5. STAGING: warn now; flips to ERROR in S7 alongside lens-no-view-state.",
            from: { path: LENSES, pathNot: [`${APP}/lenses/[^/]+/(repos|store)/`, SPEC] },
            to: { path: NGRX }
        },

        /* ───────────────────────── FEATURES — one flat top-level layer ─────────────────────────
         * A feature reaches a lens only via its READ facade (enforced above by
         * lens-external-access-only-via-public-surface); a feature reaches a state home only via that
         * home's read/write facade; feature components go through feature services; only feature
         * stores touch ngrx. */
        {
            name: "feature-no-external-access-to-internals",
            severity: "error",
            comment: "Feature internals are private. External code enters a feature only through its facade.ts or components/.",
            from: { pathNot: FEATURES },
            to: { path: FEATURES, pathNot: [`${APP}/features/[^/]+/(components/|facade\\.ts$)`] }
        },
        {
            name: "feature-cross-feature-only-via-public-api",
            severity: "error",
            comment:
                "Cross-feature imports go through facade.ts or components/ — never another feature's services/stores/selectors/model. (e2e/page-object files are exempt: they compose features and must not pull page objects through the runtime facade.)",
            from: { path: `${APP}/features/([^/]+)/`, pathNot: [E2E, PO] },
            to: {
                path: `${APP}/features/([^/]+)/`,
                pathNot: [`${APP}/features/$1/`, `${APP}/features/[^/]+/(components/|facade\\.ts$)`]
            }
        },
        {
            name: "feature-types-cannot-import-from-feature-internals",
            severity: "error",
            comment: "A feature's types/ folder holds type definitions only — it must not import from services/stores/effects.",
            from: { path: `${APP}/features/[^/]+/types/` },
            to: { path: `${APP}/features/[^/]+/(services|stores|effects)/` }
        },
        {
            name: "feature-no-circular-dependencies-between-features",
            severity: "error",
            comment:
                "Prevent circular dependencies BETWEEN features (intra-feature cycles are covered by no-circular). The codeMap/viewCube rendering cluster is grandfathered out via pathNot (codeMap<->viewCube, codeMap<->labelSettings, codeMap<->sidebarInspector, viewCube->viewCubeToolbox->codeMap) — every current cross-feature cycle touches one of those two. Break via dependency inversion and drop the exemption.",
            from: { path: `${APP}/features/([^/]+)/`, pathNot: `${APP}/features/(codeMap|viewCube)/` },
            to: {
                path: `${APP}/features/([^/]+)/`,
                pathNot: [`${APP}/features/$1/`, `${APP}/features/(codeMap|viewCube)/`],
                circular: true
            }
        },
        {
            name: "feature-reaches-state-home-only-via-facade",
            severity: "warn",
            comment:
                "A feature mutates/reads a state home only through that home's read/write facade — never its store internals. STAGING: warn until the homes exist as real roots; flips to ERROR per home as it lands (mapState S7, sharedView S8, preferences S10); fully error S10.",
            from: { path: FEATURES, pathNot: [SPEC, E2E] },
            to: { path: HOME_ROOT_T, pathNot: [HOME_READ_FACADE, HOME_WRITE_FACADE] }
        },
        {
            name: "feature-components-go-through-services",
            severity: "warn",
            comment:
                "A feature component takes its data from the feature's own services — it may not import a lens facade, a state-home facade, or @ngrx/store directly. STAGING: warn — many components read the metrics lens facade directly today; flips to ERROR in S10 once the read/write facades exist and components are repointed at feature services.",
            from: { path: FEATURE_COMPONENTS },
            to: { path: [LENS_READ_FACADE, LENS_LOAD_FACADE, HOME_READ_FACADE, HOME_WRITE_FACADE, NGRX] }
        },
        {
            name: "feature-only-stores-import-ngrx-store",
            severity: "error",
            comment: "Only a feature's stores/ or selectors/ folder may import @ngrx/store. Components use services; services use stores.",
            from: { path: FEATURES, pathNot: [FEATURE_STORES, SPEC] },
            to: { path: NGRX }
        },

        /* ───────────────────────── STATE HOMES — mapState · sharedView · preferences ─────────────────────────
         * Homes are LEAVES. CQRS: the READ facade re-exports selectors only (dispatch-free); the WRITE
         * facade is the SOLE dispatch surface — so a display-only component that imports only the read
         * facade physically cannot mutate. */
        {
            name: "state-home-is-leaf",
            severity: "warn",
            comment:
                "A state home is a leaf — it must not import lenses, renderers, pages or features (they read the home, not the reverse). It reads only the model/util kernel + its own store. STAGING: warn while appearance is still combined under appSettings and reads legacy state/ transitionally; flips to ERROR per home as it lands (mapState S6, sharedView S8, preferences S10).",
            from: { path: HOME_ROOT_T },
            to: { path: [LENSES, RENDERERS, PAGES, FEATURES] }
        },
        {
            name: "state-home-external-access-only-via-facades",
            severity: "warn",
            comment:
                "Outside code touches a home only through its read or write facade — never its store internals. STAGING: warn until each home is carved with split facades; flips to ERROR per home (mapState S7, sharedView S8, preferences S10). (`appearance` keeps its single transitional barrel until the S6 rename, governed by state-home-is-leaf.)",
            from: { pathNot: HOME_ROOT_T },
            to: { path: HOME_ROOT, pathNot: [HOME_READ_FACADE, HOME_WRITE_FACADE] }
        },
        {
            name: "state-home-read-facade-has-no-dispatch",
            severity: "warn",
            comment:
                "The READ facade re-exports selectors only — it must NOT import a home's action creators (store/**/*.actions.ts). This is what guarantees a component importing only the read facade cannot dispatch. STAGING: warn until the barrels are split; flips to ERROR per home (mapState S7, sharedView S8, preferences S10).",
            from: { path: HOME_READ_FACADE },
            to: { path: HOME_ACTIONS }
        },
        {
            name: "state-home-write-facade-is-sole-dispatch-surface",
            severity: "warn",
            comment:
                "Only the WRITE facade (and the home's own store) may import the home's action creators — every mutation of a home goes through its write facade. STAGING: warn until the barrels are split; flips to ERROR per home (mapState S7, sharedView S8, preferences S10).",
            from: { path: `${APP}/`, pathNot: [HOME_WRITE_FACADE, `${APP}/${HOMES}/store/`, SPEC] },
            to: { path: HOME_ACTIONS }
        },
        {
            name: "state-home-only-stores-import-ngrx-store",
            severity: "warn",
            comment:
                "Within a home, only its store/ folder may import @ngrx/store. STAGING: warn while appearance is transitional; flips to ERROR per home (mapState S6, sharedView S8, preferences S10).",
            from: { path: HOME_ROOT_T, pathNot: [`${APP}/${HOMES_T}/store/`, SPEC] },
            to: { path: NGRX }
        },

        /* ───────────────────────── fileStore — the raw source ───────────────────────── */
        {
            name: "filestore-has-no-upward-deps",
            severity: "error",
            comment: "FileStore is the source. It must not import lenses, renderers, pages, features or any state home.",
            from: { path: FILESTORE },
            to: { path: [LENSES, RENDERERS, PAGES, FEATURES, HOME_ROOT_T] }
        },
        {
            name: "filestore-external-access-only-via-facade",
            severity: "warn",
            comment:
                "Outside code (lenses seeding from the file, features) touches fileStore only through fileStore.facade.ts — not its repos/store/loaders internals. STAGING: warn (aspirational); flips to ERROR in S9 when the source-into-lens move settles the ingestion seam.",
            from: { pathNot: [FILESTORE, ...LOAD_PIPELINE, SPEC, E2E] },
            to: { path: FILESTORE, pathNot: [`${APP}/fileStore/[^/]+\\.facade\\.ts$`] }
        },

        /* ───────────────────────── RENDERER SEAM — dumb engines (DEFERRED to S11) ─────────────────────────
         * Kept as a NAMED contract now (load·highlight·settings + onSelect·onHover) living inside
         * features/codeMap; the folder-level enforcement below is inert until renderer #2 (Graph LSM)
         * lands the renderers/ tree, at which point both rules flip to error. */
        {
            name: "renderer-engine-stays-dumb",
            severity: "warn",
            comment:
                "A renderer engine knows geometry, not cc.json. It must NOT import lenses, pages, features, any state home, fileStore, or the wire/domain model — three + util + its own internals only. STAGING: DEFERRED/inert (no renderers/ tree yet); flips to ERROR in S11 when the Graph renderer lands.",
            from: { path: `${APP}/renderers/[^/]+/engine/` },
            to: {
                path: [LENSES, PAGES, FEATURES, HOME_ROOT_T, FILESTORE, `${APP}/codeCharta\\.(api\\.)?model\\.ts$`]
            }
        },
        {
            name: "page-uses-engine-public-api",
            severity: "warn",
            comment:
                "A page drives its renderer through the engine's public entry only (renderers/<r>/engine/<r>.engine.ts) — not its three/geometry internals. STAGING: DEFERRED/inert; flips to ERROR in S11.",
            from: { path: [PAGES, `${APP}/renderers/[^/]+/page/`] },
            to: {
                path: `${APP}/renderers/[^/]+/engine/`,
                pathNot: `${APP}/renderers/[^/]+/engine/[^/]+\\.engine\\.ts$`
            }
        },

        /* ───────────────────────── MIGRATION — the dissolving legacy state/ ───────────────────────── */
        {
            name: "new-must-not-import-legacy-state",
            severity: "warn",
            comment:
                "The new lower layers (lenses, fileStore, the state homes incl. the appearance seed) must not import the dissolving legacy state/ grab-bag (appSettings/dynamicSettings/appStatus/fileSettings + effects/selectors). Evolved from `new-must-not-import-legacy`: features/ is NO LONGER 'legacy' (it is the top-level layer; lower->feature bans live in the leaf rules), so only state/ remains a target. util/ + model/ are the shared kernel (not under state/) and exempt. STAGING: warn while transitional reads exist; flips to ERROR per home as each state/ slice empties; the rule AND state/ are removed in S10.",
            from: { path: NEW_LAYERS, pathNot: [SPEC, E2E] },
            to: { path: LEGACY_STATE }
        }
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
            dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"]
        },
        exclude: {
            // Test fixtures are not production architecture: keep mocks/ and *.mocks.ts out of the graph
            // and the boundary rules (they are only ever imported by tests).
            path: ["(^|/)node_modules/(?!@(ngrx|angular)/)", `${APP}/mocks/`, "\\.mocks\\.ts$"]
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
            // collapse each lens / feature / renderer / state home into one node for the architecture graph
            archi: {
                collapsePattern: `${APP}/(lenses/[^/]+|features/[^/]+|renderers/[^/]+|pages|mapState|sharedView|preferences|appearance|fileStore|model|util)`,
                theme: { graph: { splines: "ortho" } }
            },
            text: { highlightFocused: true }
        }
    }
}
