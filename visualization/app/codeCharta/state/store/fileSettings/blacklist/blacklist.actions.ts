import { BlacklistItem, CCAction } from "../../../../codeCharta.model"

export enum BlacklistActions {
	ADD_BLACKLIST_ITEM = "ADD_BLACKLIST_ITEM",
	REMOVE_BLACKLIST_ITEM = "REMOVE_BLACKLIST_ITEM",
	SET_BLACKLIST = "SET_BLACKLIST",
	ADD_BLACKLIST_ITEMS_IF_NOT_RESULTS_IN_EMPTY_MAP = "ADD_BLACKLIST_ITEMS_IF_NOT_RESULTS_IN_EMPTY_MAP",
	ADD_BLACKLIST_ITEMS = "ADD_BLACKLIST_ITEMS"
}

export interface AddBlacklistAction extends CCAction {
	type: BlacklistActions.ADD_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface AddBlacklistItemsIfNotResultsInEmptyMapAction extends CCAction {
	type: BlacklistActions.ADD_BLACKLIST_ITEMS_IF_NOT_RESULTS_IN_EMPTY_MAP
	payload: BlacklistItem[]
}

export interface AddBlacklistItemsAction extends CCAction {
	type: BlacklistActions.ADD_BLACKLIST_ITEMS
	payload: BlacklistItem[]
}

export interface RemoveBlacklistAction extends CCAction {
	type: BlacklistActions.REMOVE_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface SetBlacklistAction extends CCAction {
	type: BlacklistActions.SET_BLACKLIST
	payload: BlacklistItem[]
}

export type BlacklistAction =
	| AddBlacklistAction
	| RemoveBlacklistAction
	| SetBlacklistAction
	| AddBlacklistItemsAction
	| AddBlacklistItemsIfNotResultsInEmptyMapAction

export function addBlacklistItem(item: BlacklistItem): AddBlacklistAction {
	return {
		type: BlacklistActions.ADD_BLACKLIST_ITEM,
		payload: item
	}
}

export function addBlacklistItemsIfNotResultsInEmptyMap(items: BlacklistItem[]): AddBlacklistItemsIfNotResultsInEmptyMapAction {
	return {
		type: BlacklistActions.ADD_BLACKLIST_ITEMS_IF_NOT_RESULTS_IN_EMPTY_MAP,
		payload: items
	}
}

export function addBlacklistItems(items: BlacklistItem[]): AddBlacklistItemsAction {
	return {
		type: BlacklistActions.ADD_BLACKLIST_ITEMS,
		payload: items
	}
}

export function removeBlacklistItem(item: BlacklistItem): RemoveBlacklistAction {
	return {
		type: BlacklistActions.REMOVE_BLACKLIST_ITEM,
		payload: item
	}
}

export function setBlacklist(blacklist: BlacklistItem[] = defaultBlacklist): SetBlacklistAction {
	return {
		type: BlacklistActions.SET_BLACKLIST,
		payload: blacklist
	}
}

export const defaultBlacklist: BlacklistItem[] = []
