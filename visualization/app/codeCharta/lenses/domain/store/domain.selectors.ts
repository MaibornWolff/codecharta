import { createSelector } from "@ngrx/store"
import { FileState } from "../../../model/codeCharta.model"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { visibleFileStatesWithCurrentSettingsSelector } from "../../../stores/fileStore/fileStore.facade"
import { fileRoot } from "../../../util/fileRoot"

export const hasDomainDataSelector = createSelector(domainWordsSelector, words => Object.keys(words).length > 0)

export const hasTfidfDataSelector = createSelector(domainWordsSelector, words =>
    Object.values(words).some(wordList => wordList.some(word => word.tfidf !== undefined))
)

export const createWordsForSelectedNodeSelector = (selectedNodePath: string | null) =>
    createSelector(domainWordsSelector, words => words[selectedNodePath ?? fileRoot.rootPath] ?? [])

const carriesNoDomainLens = ({ file }: FileState) => Object.keys(file.settings.fileSettings.domainWords).length === 0

export const isLoadedFileSetWithoutDomainLensSelector = createSelector(
    visibleFileStatesWithCurrentSettingsSelector,
    visibleFileStates => visibleFileStates.length > 0 && visibleFileStates.every(carriesNoDomainLens)
)
