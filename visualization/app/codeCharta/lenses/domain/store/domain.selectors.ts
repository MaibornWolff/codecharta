import { createSelector } from "@ngrx/store"
import { DomainLensData, FileState } from "../../../model/codeCharta.model"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { visibleFileStatesWithCurrentSettingsSelector } from "../../../stores/fileStore/fileStore.facade"
import { fileRoot } from "../../../util/fileRoot"

export const hasDomainDataSelector = createSelector(domainWordsSelector, words => Object.keys(words).length > 0)

const pathsCarryingWords = (words: DomainLensData): ReadonlySet<string> =>
    new Set(Object.entries(words).flatMap(([path, wordList]) => (wordList.length > 0 ? [path] : [])))

export const pathsWithDomainWordsSelector = createSelector(domainWordsSelector, pathsCarryingWords)

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
