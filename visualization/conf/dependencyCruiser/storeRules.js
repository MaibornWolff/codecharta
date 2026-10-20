/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
    {
        name: "filestore-has-no-upward-deps",
        severity: "error",
        comment:
            "FileStore is the source: it sits below every view layer. It must not import lenses or any state home (stores/mapState, stores/sharedView, stores/preferences, stores/domainState) so ingestion cannot read back the state they own. Spec/e2e exempt.",
        from: { path: "^app/codeCharta/stores/fileStore/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: {
            path: [
                "^app/codeCharta/lenses/",
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/stores/domainState/"
            ]
        }
    },
    {
        name: "filestore-external-access-only-via-facade",
        severity: "error",
        comment:
            "fileStore is THE cc.json SOURCE home. Outside code reaches it ONLY through its public surface, fileStore.facade.ts. Its store/ ngrx internals (slice reducers/selectors/actions), the repos/ data-access seam (FilesRepo) and the loaders/ ingestion boundary are PRIVATE — no external module imports them: the facade re-exports the load-pipeline entry points, the files-slice read selectors + action creators, and the slice reducers/defaults the rootStore composition registers (exactly as every other home is wired via its read facade). fileStore's own code + spec/e2e are exempt. Mirrors lens-external-access-only-via-public-surface and feature-reaches-state-home-only-via-facade — the last unfenced state home.",
        from: { path: "^app/", pathNot: ["^app/codeCharta/stores/fileStore/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: {
            path: "^app/codeCharta/stores/fileStore/",
            pathNot: ["^app/codeCharta/stores/fileStore/fileStore\\.facade\\.ts$"]
        }
    },
    {
        name: "state-home-is-leaf",
        severity: "error",
        comment:
            "State-home modules — stores/mapState (map-view presentation + metric selection + transient interaction ids), stores/sharedView (focus + search + blacklist + markedPackages), stores/preferences (durable global prefs), stores/domainState (word-cloud presentation settings) — and the cc.json source stores (stores/metricsLensSource, stores/dependencyLensSource, stores/domainLensSource) are leaves. They must not import lenses; a lens/renderer/page reads the home facade, never the reverse. The home reads only the model/util kernel + its own store.",
        from: {
            path: [
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/stores/metricsLensSource/",
                "^app/codeCharta/stores/dependencyLensSource/",
                "^app/codeCharta/stores/domainLensSource/",
                "^app/codeCharta/stores/domainState/"
            ]
        },
        to: { path: ["^app/codeCharta/lenses/"] }
    },
    {
        name: "state-home-only-stores-import-ngrx",
        severity: "error",
        comment:
            "Only a state-home's store/ folder may import @ngrx/store — consumers reach the home through its facades, never by importing ngrx from home code outside store/.",
        from: {
            path: [
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/stores/metricsLensSource/",
                "^app/codeCharta/stores/dependencyLensSource/",
                "^app/codeCharta/stores/domainLensSource/",
                "^app/codeCharta/stores/domainState/"
            ],
            pathNot: [
                "^app/codeCharta/stores/mapState/store/",
                "^app/codeCharta/stores/sharedView/store/",
                "^app/codeCharta/stores/preferences/store/",
                "^app/codeCharta/stores/metricsLensSource/store/",
                "^app/codeCharta/stores/dependencyLensSource/store/",
                "^app/codeCharta/stores/domainLensSource/store/",
                "^app/codeCharta/stores/domainState/store/",
                "\\.spec\\.ts$"
            ]
        },
        to: { path: "@ngrx/store" }
    },
    {
        name: "feature-reaches-state-home-only-via-facade",
        severity: "error",
        comment:
            "Outside code reaches a state home only through its public facades (read/write), never its store/ internals — no raw import of a home's store/**/*.{selector,reducer,actions}. All four view-state homes fenced. The homes' own facades + store/ are exempt (from.pathNot); spec/e2e may wire raw for tests.",
        from: {
            path: "^app/",
            pathNot: [
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/domainState/",
                "\\.spec\\.ts$",
                "\\.e2e\\.ts$"
            ]
        },
        to: {
            path: [
                "^app/codeCharta/stores/sharedView/store/",
                "^app/codeCharta/stores/preferences/store/",
                "^app/codeCharta/stores/mapState/store/",
                "^app/codeCharta/stores/domainState/store/"
            ]
        }
    },

    {
        name: "state-home-no-cross-home-raw-store",
        severity: "error",
        comment:
            "A state home may import its OWN store/ internals (its facades re-export them) but must reach a SIBLING home only through that sibling's read/write facade — never the sibling's raw store/. Closes the home→sibling raw-store hole left by the whole-band from.pathNot exemptions in feature-reaches-state-home-only-via-facade / state-home-write-facade-is-sole-dispatch-surface / stores-own-ccjson-source (each exempts the ENTIRE home band as a source, so a sibling could reach past a facade). The $1 back-reference (home captured in from.path) exempts only the SAME home's store/. fileStore is intentionally omitted — it is fenced by filestore-external-access-only-via-facade + filestore-has-no-upward-deps.",
        from: {
            path: "^app/codeCharta/stores/(mapState|sharedView|preferences|metricsLensSource|dependencyLensSource|domainLensSource|domainState)/",
            pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"]
        },
        to: {
            path: "^app/codeCharta/stores/(mapState|sharedView|preferences|metricsLensSource|dependencyLensSource|domainLensSource|domainState)/store/",
            pathNot: ["^app/codeCharta/stores/$1/store/"]
        }
    }
]
