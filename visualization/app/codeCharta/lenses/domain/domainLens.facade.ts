/**
 * Public surface of the domain lens — a pure read projection of the cc.json `domain` lens word bank.
 * Consumers read it through these selectors; selection reaches the lens only as an explicit parameter
 * (see `wordsForSelectedNodeSelector`), never by the lens reading view state.
 */
export {
    hasDomainDataSelector,
    hasTfidfDataSelector,
    isLoadedFileSetWithoutDomainLensSelector,
    wordsForSelectedNodeSelector
} from "./store/domain.selectors"
