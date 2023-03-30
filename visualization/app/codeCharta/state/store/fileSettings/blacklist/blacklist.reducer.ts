import { addBlacklistItem, addBlacklistItems, removeBlacklistItem, setBlacklist } from "./blacklist.actions"
import { addItemsToArray, addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
import { createReducer, on } from "@ngrx/store"

export const blacklist = createReducer(
	[],
	on(setBlacklist, (_state, payload) => payload.value),
	on(addBlacklistItem, (state, payload) => addItemToArray(state, payload.item)),
	on(addBlacklistItems, (state, payload) => addItemsToArray(state, payload.items)),
	on(removeBlacklistItem, (state, payload) => removeItemFromArray(state, payload.item))
)
