import { createReducer, on } from "@ngrx/store"
import { ExcludedNode } from "../../../../model/codeCharta.model"
import { addItemsToArray, removeItemsFromArray } from "../../../../util/arrayHelper"
import { setState } from "../../../../util/setState.reducer.factory"
import { clearRulesOfType } from "../rules/rules.actions"
import { addExcludedNodes, removeExcludedNodes, setExcludedNodes } from "./excludedNodes.actions"

export const defaultExcludedNodes: ExcludedNode[] = []
export const excludedNodes = createReducer(
    defaultExcludedNodes,
    on(setExcludedNodes, setState(defaultExcludedNodes)),
    on(addExcludedNodes, (state, action) => addItemsToArray(state, action.items)),
    on(removeExcludedNodes, (state, action) => removeItemsFromArray(state, action.items)),
    on(clearRulesOfType, (state, action) => (action.ruleEffect === "exclude" ? defaultExcludedNodes : state))
)
