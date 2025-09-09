import { addBlacklistItem, addBlacklistItems, removeBlacklistItem, removeBlacklistItems, setBlacklist } from "./blacklist.actions"
import { addItemsToArray, addItemToArray, removeItemFromArray, removeItemsFromArray } from "../../../../util/arrayHelper"
import { createReducer, on } from "@ngrx/store"
import { BlacklistItem } from "../../../../codeCharta.model"
import { setState } from "../../util/setState.reducer.factory"

export const defaultBlacklist: BlacklistItem[] = []
export const blacklist = createReducer(
    defaultBlacklist,
    on(setBlacklist, setState(defaultBlacklist)),
    on(addBlacklistItem, (state, action) => addItemToArray(state, action.item)),
    on(addBlacklistItems, (state, action) => addItemsToArray(state, action.items)),
    on(removeBlacklistItem, (state, action) => removeItemFromArray(state, action.item)),
    on(removeBlacklistItems, (state, action) => removeItemsFromArray(state, action.items))
)
