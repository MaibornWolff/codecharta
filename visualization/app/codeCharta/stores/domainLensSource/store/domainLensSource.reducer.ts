import { combineReducers } from "@ngrx/store"
import { DomainLensSource } from "../../../model/codeCharta.model"
import { defaultDomainWords, domainWords } from "./words/words.reducer"

export const domainLensSource = combineReducers({
    words: domainWords
})

export const defaultDomainLensSource: DomainLensSource = {
    words: defaultDomainWords
}
