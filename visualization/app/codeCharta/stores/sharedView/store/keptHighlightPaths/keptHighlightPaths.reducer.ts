import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../model/codeCharta.model"
import { clearKeptHighlight, keepHighlight, removeKeptHighlight } from "./keptHighlightPaths.actions"

export const defaultKeptHighlightPaths: CcState["sharedView"]["keptHighlightPaths"] = []
export const keptHighlightPaths = createReducer(
    defaultKeptHighlightPaths,
    on(keepHighlight, (state, { paths }) => [...new Set([...state, ...paths])]),
    on(removeKeptHighlight, (state, { paths }) => {
        const removedPaths = new Set(paths)
        return state.filter(path => !removedPaths.has(path))
    }),
    on(clearKeptHighlight, () => defaultKeptHighlightPaths)
)
