import { BlacklistItem } from "../../../../codeCharta.model"
import { Action } from "redux"

export enum BlacklistActions {
	ADD_BLACKLIST_ITEM = "ADD_BLACKLIST_ITEM",
	REMOVE_BLACKLIST_ITEM = "REMOVE_BLACKLIST_ITEM",
	LOAD_BLACKLIST = "LOAD_BLACKLIST"
}

export interface AddBlacklistAction extends Action {
	type: BlacklistActions.ADD_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface RemoveBlacklistAction extends Action {
	type: BlacklistActions.REMOVE_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface LoadBlacklistAction extends Action {
	type: BlacklistActions.LOAD_BLACKLIST
	payload: BlacklistItem[]
}

// Bundle all the types
export type BlacklistAction = AddBlacklistAction | RemoveBlacklistAction | LoadBlacklistAction

// Declare your action creators here
export function addBlacklistItem(item: BlacklistItem): BlacklistAction {
	return {
		type: BlacklistActions.ADD_BLACKLIST_ITEM,
		payload: item
	}
}

export function removeBlacklistItem(item: BlacklistItem): BlacklistAction {
	return {
		type: BlacklistActions.REMOVE_BLACKLIST_ITEM,
		payload: item
	}
}

export function loadBlacklist(blacklist: BlacklistItem[]): BlacklistAction {
	return {
		type: BlacklistActions.LOAD_BLACKLIST,
		payload: blacklist
	}
}
