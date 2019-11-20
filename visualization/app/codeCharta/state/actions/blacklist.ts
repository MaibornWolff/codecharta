import { BlacklistItem } from "../../codeCharta.model"

export enum BlacklistActions {
	ADD_BLACKLIST_ITEM = "ADD_BLACKLIST_ITEM",
	REMOVE_BLACKLIST_ITEM = "REMOVE_BLACKLIST_ITEM",
	CLEAR_BLACKLIST = "CLEAR_BLACKLIST",
	LOAD_BLACKLIST = "LOAD_BLACKLIST"
}

export interface AddBlacklistAction {
	type: BlacklistActions.ADD_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface RemoveBlacklistAction {
	type: BlacklistActions.REMOVE_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface ClearBlacklistAction {
	type: BlacklistActions.CLEAR_BLACKLIST
}

export interface LoadBlacklistAction {
	type: BlacklistActions.LOAD_BLACKLIST
	payload: BlacklistItem[]
}

// Bundle all the types
export type BlacklistAction = AddBlacklistAction | RemoveBlacklistAction | ClearBlacklistAction | LoadBlacklistAction

// Declare your action creators here
export function addBlacklistItem(item: BlacklistItem) {
	return {
		type: BlacklistActions.ADD_BLACKLIST_ITEM,
		payload: item
	}
}

export function removeBlacklistItem(item: BlacklistItem) {
	return {
		type: BlacklistActions.REMOVE_BLACKLIST_ITEM,
		payload: item
	}
}

export function clearBlacklist(item: BlacklistItem) {
	return {
		type: BlacklistActions.CLEAR_BLACKLIST
	}
}

export function loadBlacklist(blacklist: BlacklistItem[]) {
	return {
		type: BlacklistActions.LOAD_BLACKLIST,
		payload: blacklist
	}
}
