import { createReducer, on } from "@ngrx/store"
import { FlattenedNode } from "../../../../model/codeCharta.model"
import { addItemsToArray, removeItemsFromArray } from "../../../../util/arrayHelper"
import { setState } from "../../../../util/setState.reducer.factory"
import { clearRulesOfType } from "../rules/rules.actions"
import { addFlattenedNodes, removeFlattenedNodes, setFlattenedNodes } from "./flattenedNodes.actions"

export const defaultFlattenedNodes: FlattenedNode[] = []
export const flattenedNodes = createReducer(
    defaultFlattenedNodes,
    on(setFlattenedNodes, setState(defaultFlattenedNodes)),
    on(addFlattenedNodes, (state, action) => addItemsToArray(state, action.items)),
    on(removeFlattenedNodes, (state, action) => removeItemsFromArray(state, action.items)),
    on(clearRulesOfType, (state, action) => (action.ruleEffect === "flatten" ? defaultFlattenedNodes : state))
)
