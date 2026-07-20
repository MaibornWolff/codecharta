import { combineReducers } from "@ngrx/store"
import { DomainLensSource } from "../../../model/codeCharta.model"
import { defaultDomainWords, domainWords } from "./words/words.reducer"

// The domain lens's cc.json SOURCE root: the path-keyed word bank, seeded from the loaded cc.json's
// `domain` lens (re-keyed nodeId→path at load). Unlike the metrics/dependency sources it carries bulk
// per-node data rather than attribute metadata, but it is wired the same way through the load pipeline.
export const domainLensSource = combineReducers({
    words: domainWords
})

export const defaultDomainLensSource: DomainLensSource = {
    words: defaultDomainWords
}
