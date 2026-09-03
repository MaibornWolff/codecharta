import { ExplorerSortConfig } from "../../../features/sidebarExplorer/facade"
import { SortingOption } from "../../../model/codeCharta.model"
import {
    domainStateSortingOrderAscendingSelector,
    domainStateSortingOrderSelector
} from "../../../stores/domainState/domainState.read.facade"
import { setDomainStateSortingOrder, setDomainStateSortingOrderAscending } from "../../../stores/domainState/domainState.write.facade"

export const DOMAIN_EXPLORER_SORT: ExplorerSortConfig = {
    // The domain view has no area metric, so it drops Area Size.
    options: [SortingOption.NAME, SortingOption.NUMBER_OF_FILES],
    optionSelector: domainStateSortingOrderSelector,
    ascendingSelector: domainStateSortingOrderAscendingSelector,
    setOption: setDomainStateSortingOrder,
    toggleAscending: currentAscending => setDomainStateSortingOrderAscending({ value: !currentAscending })
}
