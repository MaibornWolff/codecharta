import { ExplorerSortConfig } from "../../../features/sidebarExplorer/facade"
import {
    domainStateSortingOrderAscendingSelector,
    domainStateSortingOrderSelector
} from "../../../stores/domainState/domainState.read.facade"
import { setDomainStateSortingOrder, setDomainStateSortingOrderAscending } from "../../../stores/domainState/domainState.write.facade"

export const DOMAIN_EXPLORER_SORT: ExplorerSortConfig = {
    optionSelector: domainStateSortingOrderSelector,
    ascendingSelector: domainStateSortingOrderAscendingSelector,
    setOption: setDomainStateSortingOrder,
    toggleAscending: currentAscending => setDomainStateSortingOrderAscending({ value: !currentAscending })
}
