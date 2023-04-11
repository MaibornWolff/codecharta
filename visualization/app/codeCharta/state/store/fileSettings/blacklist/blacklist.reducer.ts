import { addBlacklistItem, addBlacklistItems, removeBlacklistItem, setBlacklist } from "./blacklist.actions"
import { addItemsToArray, addItemToArray, removeItemFromArray } from "../../../../util/arrayHelper"
import { createReducer, on } from "@ngrx/store"
import { BlacklistItem } from "../../../../codeCharta.model"

export const defaultBlacklist: BlacklistItem[] = []
export const blacklist = createReducer(
	defaultBlacklist,
	on(setBlacklist, (_state, action) => action.value),
	on(addBlacklistItem, (state, action) => addItemToArray(state, action.item)),
	on(addBlacklistItems, (state, action) => addItemsToArray(state, action.items)),
	on(removeBlacklistItem, (state, action) => removeItemFromArray(state, action.item))
)
