import { CcState } from "../../../model/codeCharta.model"

/**
 * The merged domain word bank, left out of what is persisted. It is derived state: the reconciliation
 * rebuilds it from the loaded files on every load, so persisting it only writes a second copy of a bank
 * the files already carry. That copy is expensive rather than merely redundant — an IndexedDB write
 * structured-clones every entry on the main thread, and a large project's bank holds millions of them.
 */
export function withoutDerivedDomainWords(state: CcState): CcState {
    return { ...state, domainLensSource: { ...state.domainLensSource, words: {} } }
}
