import { createAction, props } from "@ngrx/store"
import { BlacklistItem } from "../../../../codeCharta.model"

export const setBlacklist = createAction("SET_BLACKLIST", props<{ value: BlacklistItem[] }>())
export const addBlacklistItem = createAction("ADD_BLACKLIST_ITEM", props<{ item: BlacklistItem }>())
export const addBlacklistItems = createAction("ADD_BLACKLIST_ITEMS", props<{ items: BlacklistItem[] }>())
export const removeBlacklistItem = createAction("REMOVE_BLACKLIST_ITEM", props<{ item: BlacklistItem }>())
export const addBlacklistItemsIfNotResultsInEmptyMap = createAction(
	"ADD_BLACKLIST_ITEMS_IF_NOT_RESULTS_IN_EMPTY_MAP",
	props<{ items: BlacklistItem[] }>()
)

export const defaultBlacklist: BlacklistItem[] = []
