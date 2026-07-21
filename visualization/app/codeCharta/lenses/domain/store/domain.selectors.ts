import { createSelector } from "@ngrx/store"
import { FileState } from "../../../model/codeCharta.model"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { visibleFileStatesWithCurrentSettingsSelector } from "../../../stores/fileStore/fileStore.facade"
import { fileRoot } from "../../../util/fileRoot"

/** Whether the loaded file exposes any domain words at all — gates the domain view / view switcher. */
export const hasDomainDataSelector = createSelector(domainWordsSelector, words => Object.keys(words).length > 0)

/** Whether any domain word carries a tfidf score — gates the tfidf sizing option in the domain bar. */
export const hasTfidfDataSelector = createSelector(domainWordsSelector, words =>
    Object.values(words).some(wordList => wordList.some(word => word.tfidf !== undefined))
)

/**
 * The domain words for the selected node. `selectedBuildingId` is a node path (or `null` in the default
 * state, before any selection) — passed in by the composing layer so the lens never reads view state
 * itself. A `null` id falls back to the root path, whose folder-aggregated words seed the initial cloud.
 */
export const createWordsForSelectedNodeSelector = (selectedBuildingId: string | null) =>
    createSelector(domainWordsSelector, words => words[selectedBuildingId ?? fileRoot.rootPath] ?? [])

const carriesNoDomainLens = ({ file }: FileState) => Object.keys(file.settings.fileSettings.domainWords).length === 0

/**
 * True once a file set is loaded in which no file carries a domain lens (a cc.json 1.x file set).
 *
 * Derived from the per-file banks rather than from `hasDomainDataSelector`: the merged word bank the latter
 * reads is only written by `ReconcileAfterLoadEffect` a macrotask after the files reach the store (its
 * trigger is buffered behind a `debounceTime(0)`). During that window the merged bank is still the empty
 * default, so combining the two facts — however carefully — reports "a file is loaded and it has no domain
 * lens" for EVERY freshly loaded file, cc.json 2.0 files included. The per-file banks are part of the very
 * state transition that makes the files visible, so reading them has no such window.
 */
export const isLoadedFileSetWithoutDomainLensSelector = createSelector(
    visibleFileStatesWithCurrentSettingsSelector,
    visibleFileStates => visibleFileStates.length > 0 && visibleFileStates.every(carriesNoDomainLens)
)
