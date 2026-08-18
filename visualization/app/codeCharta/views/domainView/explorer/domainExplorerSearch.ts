import { ExplorerSearchConfig } from "../../../features/sidebarExplorer/facade"
import { domainStateSearchPatternSelector } from "../../../stores/domainState/domainState.read.facade"
import { setDomainStateSearchPattern } from "../../../stores/domainState/domainState.write.facade"

export const DOMAIN_EXPLORER_SEARCH: ExplorerSearchConfig = {
    patternSelector: domainStateSearchPatternSelector,
    setPattern: setDomainStateSearchPattern
}
