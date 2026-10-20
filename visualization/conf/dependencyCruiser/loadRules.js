/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
    /* load/ (the initial-file orchestrator) is still top-level and unplaced (see TARGET-ARCHITECTURE.md
     * "Open questions"); revisit when it gets a home (likely an `app-root` band above views/). */
    {
        name: "load-orchestrator-not-imported-by-lower-layers",
        severity: "error",
        comment:
            "load/ is the initial-file load orchestrator: on startup it hydrates state from a persisted/URL cc.json by driving the homes, lenses and fileStore through their public facades/actions. It is a TOP layer — nothing it writes into may import it back. Homes (stores/mapState, stores/sharedView, stores/preferences, stores/domainState), the cc.json source stores (stores/metricsLensSource, stores/dependencyLensSource, stores/domainLensSource), lenses AND stores/fileStore must not depend on load/. renderer's own upward edges to load/ are fenced by renderer-does-not-import-up. Spec/e2e exempt. PARKED path.",
        from: {
            path: [
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/lenses/",
                "^app/codeCharta/stores/fileStore/",
                "^app/codeCharta/stores/metricsLensSource/",
                "^app/codeCharta/stores/dependencyLensSource/",
                "^app/codeCharta/stores/domainLensSource/",
                "^app/codeCharta/stores/domainState/"
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
        from: { path: "^app/", pathNot: ["^app/codeCharta/load/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
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
        from: {
            path: [
                "^app/codeCharta/lenses/",
                "^app/codeCharta/stores/fileStore/",
                "^app/codeCharta/stores/metricsLensSource/",
                "^app/codeCharta/stores/dependencyLensSource/",
                "^app/codeCharta/stores/domainLensSource/",
                "^app/codeCharta/stores/domainState/"
            ],
            pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"]
        },
        to: { path: ["^app/codeCharta/features/"] }
    },
    {
        name: "root-store-is-sole-composer",
        severity: "error",
        comment:
            "stores/rootStore/store.ts is the ngrx ROOT composition: the per-home reducer map (appReducers) + the global setState meta-reducer. Only the app composition root (app/app.config.ts) may import it. The reusable root-state CONTRACT (defaultState + deep-merge kernel in stores/rootStore/state.manager, the global setState action in stores/rootStore/state.actions) is deliberately kept OUT of this module so consumers never touch the composition. Spec/e2e exempt. Slice 19c nested the composition root under stores/ (it composes the home stores + depends only on stores/util/model, so it lives in the same band); 19d named it rootStore/ — the root store that composes the home stores.",
        from: { path: "^app/", pathNot: ["^app/app\\.config\\.ts$", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: { path: "^app/codeCharta/stores/rootStore/store\\.ts$" }
    }
]
