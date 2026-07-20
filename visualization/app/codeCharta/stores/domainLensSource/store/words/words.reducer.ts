import { createReducer, on } from "@ngrx/store"
import { DomainLensData } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDomainWords } from "./words.actions"

export const defaultDomainWords: DomainLensData = {}
export const domainWords = createReducer(defaultDomainWords, on(setDomainWords, setState(defaultDomainWords)))
