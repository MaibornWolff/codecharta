import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { hideDomainWord, restoreAllDomainWords, restoreDomainWord, setDomainStateHiddenWords } from "./hiddenWords.actions"

export const defaultHiddenWords: string[] = []

export const hiddenWords = createReducer(
    defaultHiddenWords,
    on(setDomainStateHiddenWords, setState(defaultHiddenWords)),
    on(hideDomainWord, (state, { word }) => (state.includes(word) ? state : [...state, word])),
    on(restoreDomainWord, (state, { word }) => state.filter(hiddenWord => hiddenWord !== word)),
    on(restoreAllDomainWords, () => defaultHiddenWords)
)
