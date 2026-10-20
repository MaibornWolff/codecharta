/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
    {
        name: "render-model-is-top-derived",
        severity: "error",
        comment:
            "renderer/renderModel/ is the cross-lens composing layer: it folds the structure/metrics/dependency lenses + the view-state homes into the decorated tree and its derived read models. It sits ABOVE the lenses and homes — it reads their facades DOWNWARD — so nothing below it may import it back: lenses, stores/fileStore (the source), the view-state homes (stores/mapState, stores/sharedView, stores/preferences, stores/domainState) and the cc.json source stores (stores/metricsLensSource, stores/dependencyLensSource, stores/domainLensSource) must not depend on it. Consumers ABOVE it (features/, views/, load/, the renderer engine) reach every composing selector through renderModel.facade. Spec/e2e exempt.",
        from: {
            path: [
                "^app/codeCharta/lenses/",
                "^app/codeCharta/stores/fileStore/",
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/stores/metricsLensSource/",
                "^app/codeCharta/stores/dependencyLensSource/",
                "^app/codeCharta/stores/domainLensSource/",
                "^app/codeCharta/stores/domainState/"
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
        from: { path: "^app/", pathNot: ["^app/codeCharta/renderer/renderModel/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
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
    {
        name: "threeviewer-external-access-only-via-facade",
        severity: "error",
        comment:
            "Outside code may touch the shared 3D engine (renderer/threeViewer/ — the Three.js scene/camera/renderer/controls services, the codeMap mesh + building render primitives, the treemap/street layout ALGORITHM and the scene stores) ONLY through its public surface, renderer/threeViewer/threeViewer.facade.ts. Its internals are heavily cross-wired and must stay private so sibling features (codeMap, viewCube, labelSettings, …) consume the engine without reaching past the facade and forming cycles (this layer was extracted OUT of features/codeMap for exactly that reason). Mirrors lens-external-access-only-via-public-surface. The layer's own files (from.pathNot) — including the facade re-exporting its internals — and spec/e2e are exempt.",
        from: { path: "^app/", pathNot: ["^app/codeCharta/renderer/threeViewer/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: {
            path: "^app/codeCharta/renderer/threeViewer/",
            pathNot: ["^app/codeCharta/renderer/threeViewer/threeViewer\\.facade\\.ts$"]
        }
    },

    {
        name: "wordcloud-external-access-only-via-facade",
        severity: "error",
        comment:
            "Outside code may touch the word-cloud engine (renderer/wordCloud/ — the ECharts + echarts-wordcloud 2D canvas host, its pure option builder and its read/write stores) ONLY through its public surfaces: renderer/wordCloud/wordCloud.facade.ts (the engine, including the component) and renderer/wordCloud/wordCloudRegistry.facade.ts (the chart handle alone). The second, narrower facade exists because the first re-exports WordCloudComponent, whose static echarts import would pull the whole charting library out of the lazy domain-view chunk into the initial bundle for any eagerly loaded consumer that only wanted the registry. This is the SECOND rendering engine and a peer of threeViewer: an engine belongs in renderer/, behind a facade, below the features that drive it — it was promoted out of features/wordCloud/ where it had landed during the as-is port from DomainLanguageCharta. Mirrors threeviewer-external-access-only-via-facade. The layer's own files (from.pathNot) and spec/e2e are exempt.",
        from: { path: "^app/", pathNot: ["^app/codeCharta/renderer/wordCloud/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: {
            path: "^app/codeCharta/renderer/wordCloud/",
            pathNot: [
                "^app/codeCharta/renderer/wordCloud/wordCloud\\.facade\\.ts$",
                "^app/codeCharta/renderer/wordCloud/wordCloudRegistry\\.facade\\.ts$"
            ]
        }
    },
    {
        name: "dependencygraph-external-access-only-via-facade",
        severity: "error",
        comment:
            "Outside code may touch the dependency graph engine (renderer/dependencyGraph/ — the ECharts host of the levelized dependency graph, its pure tree, layout, edge projection and option builders) ONLY through renderer/dependencyGraph/dependencyGraph.facade.ts (the engine, including the component) and renderer/dependencyGraph/dependencyGraphRegistry.facade.ts (the chart handle alone, kept echarts-free for the eagerly loaded screenshot service). Mirrors radialmap-external-access-only-via-facade. The layer's own files and spec/e2e are exempt.",
        from: { path: "^app/", pathNot: ["^app/codeCharta/renderer/dependencyGraph/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: {
            path: "^app/codeCharta/renderer/dependencyGraph/",
            pathNot: [
                "^app/codeCharta/renderer/dependencyGraph/dependencyGraph\\.facade\\.ts$",
                "^app/codeCharta/renderer/dependencyGraph/dependencyGraphRegistry\\.facade\\.ts$"
            ]
        }
    },
    {
        name: "radialmap-external-access-only-via-facade",
        severity: "error",
        comment:
            "Outside code may touch the radial map engine (renderer/radialMap/ — the ECharts host of the radial map layouts, its pure tree and option builders) ONLY through renderer/radialMap/radialMap.facade.ts (the engine, including the component) and renderer/radialMap/radialMapRegistry.facade.ts (the chart handle alone, kept echarts-free for the eagerly loaded screenshot service). Mirrors wordcloud-external-access-only-via-facade. The layer's own files and spec/e2e are exempt.",
        from: { path: "^app/", pathNot: ["^app/codeCharta/renderer/radialMap/", "\\.spec\\.ts$", "\\.e2e\\.ts$"] },
        to: {
            path: "^app/codeCharta/renderer/radialMap/",
            pathNot: [
                "^app/codeCharta/renderer/radialMap/radialMap\\.facade\\.ts$",
                "^app/codeCharta/renderer/radialMap/radialMapRegistry\\.facade\\.ts$"
            ]
        }
    }
]
