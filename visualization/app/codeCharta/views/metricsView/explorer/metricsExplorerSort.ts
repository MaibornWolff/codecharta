import { ExplorerSortConfig } from "../../../features/sidebarExplorer/facade"
import { sortingOrderAscendingSelector, sortingOrderSelector } from "../../../stores/preferences/preferences.read.facade"
import { setSortingOption, toggleSortingOrderAscending } from "../../../stores/preferences/preferences.write.facade"

export const METRICS_EXPLORER_SORT: ExplorerSortConfig = {
    optionSelector: sortingOrderSelector,
    ascendingSelector: sortingOrderAscendingSelector,
    setOption: setSortingOption,
    toggleAscending: () => toggleSortingOrderAscending()
}
