import { computed, inject, Provider } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EXPLORER_CONDITIONAL_MODES, ExplorerMode } from "../sidebarExplorer/facade"
import { ClusterExplorerReadStore } from "./stores/clusterExplorer.read.store"

const CLUSTERS_EXPLORER_MODE: ExplorerMode = {
    id: "clusters",
    label: "Clusters",
    icon: "fa-solid fa-users",
    searchPlaceholder: "*.js, **/app/*",
    searchAriaLabel: "Search files and folders",
    hidesListTools: true
}

export function provideClustersExplorerMode(): Provider {
    return {
        provide: EXPLORER_CONDITIONAL_MODES,
        useFactory: () => {
            const hasClusterings = toSignal(inject(ClusterExplorerReadStore).hasClusterings$, { requireSync: true })
            return computed(() => (hasClusterings() ? [CLUSTERS_EXPLORER_MODE] : []))
        }
    }
}
