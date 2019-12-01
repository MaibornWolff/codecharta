import { BlacklistItem, CCAction } from "../../../../codeCharta.model"

export enum BlacklistActions {
	ADD_BLACKLIST_ITEM = "ADD_BLACKLIST_ITEM",
	REMOVE_BLACKLIST_ITEM = "REMOVE_BLACKLIST_ITEM",
	SET_BLACKLIST = "SET_BLACKLIST"
}

export interface AddBlacklistAction extends CCAction {
	type: BlacklistActions.ADD_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface RemoveBlacklistAction extends CCAction {
	type: BlacklistActions.REMOVE_BLACKLIST_ITEM
	payload: BlacklistItem
}

export interface SetBlacklistAction extends CCAction {
	type: BlacklistActions.SET_BLACKLIST
	payload: BlacklistItem[]
}

export type BlacklistAction = AddBlacklistAction | RemoveBlacklistAction | SetBlacklistAction

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

export function setBlacklist(blacklist: BlacklistItem[]): BlacklistAction {
	return {
		type: BlacklistActions.SET_BLACKLIST,
		payload: blacklist
	}
}
