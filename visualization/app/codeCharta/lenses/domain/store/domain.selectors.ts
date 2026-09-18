import { createSelector } from "@ngrx/store"
import { FileState } from "../../../model/codeCharta.model"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { visibleFileStatesWithCurrentSettingsSelector } from "../../../stores/fileStore/fileStore.facade"
import { fileRoot } from "../../../util/fileRoot"
import { viewIndependentTreeSelector } from "../../structure/structure.facade"
import { createDomainWordIndex } from "./domainWordIndex"
import { buildWordOccurrenceTree } from "./wordOccurrences"

export const hasDomainDataSelector = createSelector(domainWordsSelector, words => Object.keys(words).length > 0)

export const domainWordIndexSelector = createSelector(domainWordsSelector, createDomainWordIndex)

export const pathsWithDomainWordsSelector = createSelector(domainWordIndexSelector, index => index.pathsWithWords)

export const hasTfidfDataSelector = createSelector(domainWordsSelector, words =>
    Object.values(words).some(wordList => wordList.some(word => word.tfidf !== undefined))
)

export const projectWordsSelector = createSelector(domainWordIndexSelector, index => index.wordsOf(fileRoot.rootPath))

export const createWordsForSelectedNodeSelector = (selectedNodePath: string | null) =>
    createSelector(domainWordIndexSelector, index => index.wordsOf(selectedNodePath ?? fileRoot.rootPath))

export const createWordOccurrencesSelector = (scopePath: string | null, word: string | null) =>
    createSelector(viewIndependentTreeSelector, domainWordsSelector, (tree, words) =>
        word === null ? null : buildWordOccurrenceTree(tree, words, scopePath ?? fileRoot.rootPath, word)
    )

const carriesNoDomainLens = ({ file }: FileState) => Object.keys(file.settings.fileSettings.domainWords).length === 0

export const isLoadedFileSetWithoutDomainLensSelector = createSelector(
    visibleFileStatesWithCurrentSettingsSelector,
    visibleFileStates => visibleFileStates.length > 0 && visibleFileStates.every(carriesNoDomainLens)
)
