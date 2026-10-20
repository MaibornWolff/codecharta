/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
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
            "Outside code may touch a lens only through its public surface: the lens facade (for data). Never its services, repos, stores or models.",
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
            "The cc.json SOURCE state now lives in stores/ (Slice 19b moved it OUT of the lenses so the ngrx composition root store/ no longer imports lenses/): the metricsLensSource home (node attributeTypes + attributeDescriptors + the metricsLensSource root reducer/selector) the dependencyLensSource home (edge attributeTypes + the dependencyLensSource root) and the domainLensSource home (domain words + the domainLensSource root). Its ngrx store/ internals are reached from outside the owning home ONLY through that home's read/write facade — so the composition root (store/), the load pipeline (load/) and the now-pure-projection lenses all go through the facades, never store/ internals. Replaces the old lens-owns-ccjson-source rule (the source is no longer lens-owned). Spec/e2e/mocks exempt.",
        from: {
            path: "^app/",
            pathNot: [
                "^app/codeCharta/stores/metricsLensSource/",
                "^app/codeCharta/stores/dependencyLensSource/",
                "^app/codeCharta/stores/domainLensSource/",
                "\\.spec\\.ts$",
                "\\.e2e\\.ts$",
                "\\.mocks\\.ts$"
            ]
        },
        to: {
            path: [
                "^app/codeCharta/stores/metricsLensSource/store/",
                "^app/codeCharta/stores/dependencyLensSource/store/",
                "^app/codeCharta/stores/domainLensSource/store/"
            ]
        }
    },
    {
        name: "lens-no-view-state",
        severity: "error",
        comment:
            "A lens is data/projection, never a reader of mutable VIEW STATE. Lens code (lenses/**) must not import a state home — stores/mapState, stores/sharedView, stores/preferences or stores/domainState — nor any view-state selector; selection/blacklist/edge-visibility reach a lens only as explicit parameters passed by the composing layer (renderModel). This half of the lens‖home fence is why 'Lenses above Stores' is a readability order, not a real edge. Spec/e2e exempt.",
        from: { path: "^app/codeCharta/lenses/", pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: {
            path: [
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/stores/domainState/"
            ]
        }
    }
]
