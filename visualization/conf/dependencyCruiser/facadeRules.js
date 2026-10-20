/** @type {import('dependency-cruiser').IForbiddenRuleType[]} */
module.exports = [
    {
        name: "state-home-write-facade-is-sole-dispatch-surface",
        severity: "error",
        comment:
            "A state home's action creators are reached from outside the home ONLY through its write facade (<home>.write.facade.ts), never the raw store/**/*.actions.ts files. Spec/e2e exempt.",
        from: {
            path: "^app/",
            pathNot: [
                "^app/codeCharta/stores/preferences/",
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/domainState/",
                "\\.spec\\.ts$",
                "\\.e2e\\.ts$"
            ]
        },
        to: {
            path: [
                "^app/codeCharta/stores/preferences/store/.*\\.actions\\.ts$",
                "^app/codeCharta/stores/sharedView/store/.*\\.actions\\.ts$",
                "^app/codeCharta/stores/mapState/store/.*\\.actions\\.ts$",
                "^app/codeCharta/stores/domainState/store/.*\\.actions\\.ts$"
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
                "^app/codeCharta/stores/mapState/mapState\\.read\\.facade\\.ts$",
                "^app/codeCharta/stores/domainState/domainState\\.read\\.facade\\.ts$"
            ]
        },
        to: {
            path: [
                "^app/codeCharta/stores/preferences/store/.*\\.actions\\.ts$",
                "^app/codeCharta/stores/sharedView/store/.*\\.actions\\.ts$",
                "^app/codeCharta/stores/mapState/store/.*\\.actions\\.ts$",
                "^app/codeCharta/stores/domainState/store/.*\\.actions\\.ts$"
            ]
        }
    },
    {
        name: "home-selectors-are-declared-in-their-home",
        severity: "error",
        comment:
            "A home's ROOT selector (the raw `state => state.<home>` slice accessor: mapStateSelector, preferencesSelector, sharedViewSelector, filesSelector, domainStateSelector) is a private store/ internal. Only the owning home's own store/ folder may import it — that is where every derived leaf selector (areaMetricSelector, blacklistSelector, isDeltaStateSelector, …) and the home's read window (store/<home>.readWindow.ts) are declared. Handing the root selector out lets a consumer re-derive home state OUTSIDE the home, which duplicates the home's projection surface in feature land and defeats the read facade; this rule mechanically bans createSelector(mapStateSelector, …) in features/. Consumers get a NAMED derived selector or a read-window stream from the home's read facade instead. The facades are deliberately NOT exempt: dependency-cruiser sees only the module edge consumer→facade, so a barrel re-export of the root selector would bypass the fence — hence none of the five barrels re-exports one. Spec/e2e exempt.",
        from: {
            path: "^app/",
            pathNot: [
                "^app/codeCharta/stores/mapState/store/",
                "^app/codeCharta/stores/preferences/store/",
                "^app/codeCharta/stores/sharedView/store/",
                "^app/codeCharta/stores/fileStore/store/",
                "^app/codeCharta/stores/domainState/store/",
                "\\.spec\\.ts$",
                "\\.e2e\\.ts$"
            ]
        },
        to: {
            path: [
                "^app/codeCharta/stores/mapState/store/mapState\\.selector\\.ts$",
                "^app/codeCharta/stores/preferences/store/preferences\\.selector\\.ts$",
                "^app/codeCharta/stores/sharedView/store/sharedView\\.selector\\.ts$",
                "^app/codeCharta/stores/fileStore/store/files\\.selector\\.ts$",
                "^app/codeCharta/stores/domainState/store/domainState\\.selector\\.ts$"
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
                "^app/codeCharta/stores/mapState/mapState\\.write\\.facade\\.ts$",
                "^app/codeCharta/stores/domainState/domainState\\.write\\.facade\\.ts$"
            ]
        }
    },
    {
        name: "sidebar-explorer-is-view-agnostic",
        severity: "error",
        comment:
            "The sidebar explorer is shared by the metrics, domain and dependency views, so it must not read or write ANY view's state: no sharedView/mapState/domainState, no renderModel, no threeViewer. Everything view-specific arrives through the per-view ports (EXPLORER_ROW / SELECTION / CONTEXT_MENU / TREE / SORT / SEARCH / COUNTS / RULES), which are implemented per view in views/ — or, where the metrics and dependency views browse the same map, once in features/mapExplorer — that is what keeps the domain explorer from inheriting the map's marked packages, blacklist, counts and searched nodes. The provideExplorerSearch/Sort factories take a per-view selector+action config, so they never name a home themselves. Spec/e2e exempt.",
        from: {
            path: "^app/codeCharta/features/sidebarExplorer/",
            pathNot: ["\\.spec\\.ts$", "\\.e2e\\.ts$"]
        },
        to: {
            path: [
                "^app/codeCharta/stores/sharedView/",
                "^app/codeCharta/stores/mapState/",
                "^app/codeCharta/stores/domainState/",
                "^app/codeCharta/renderer/"
            ]
        }
    }
]
