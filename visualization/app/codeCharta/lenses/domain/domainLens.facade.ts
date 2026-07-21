/**
 * Public surface of the domain lens — a pure read projection of the cc.json `domain` lens word bank.
 * Consumers read it through these selectors; selection reaches the lens only as an explicit parameter
 * (see `createWordsForSelectedNodeSelector`), never by the lens reading view state.
 */
export {
    createWordsForSelectedNodeSelector,
    hasDomainDataSelector,
    hasTfidfDataSelector,
    isLoadedFileSetWithoutDomainLensSelector
} from "./store/domain.selectors"
