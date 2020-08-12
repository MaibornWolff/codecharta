import { BlacklistItem, CCAction } from "../../../../codeCharta.model"

export enum BlacklistActions {
	ADD_BLACKLIST_ITEM = "ADD_BLACKLIST_ITEM",
	REMOVE_BLACKLIST_ITEM = "REMOVE_BLACKLIST_ITEM",
	REMOVE_LAST_BLACKLIST_ITEM = "REMOVE_LAST_BLACKLIST_ITEM",
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

export interface RemoveLastBlacklistItemAction extends CCAction {
	type: BlacklistActions.REMOVE_LAST_BLACKLIST_ITEM
}

export interface SetBlacklistAction extends CCAction {
	type: BlacklistActions.SET_BLACKLIST
	payload: BlacklistItem[]
}

export type BlacklistAction = AddBlacklistAction | RemoveBlacklistAction | RemoveLastBlacklistItemAction | SetBlacklistAction

export function addBlacklistItem(item: BlacklistItem): AddBlacklistAction {
	return {
		type: BlacklistActions.ADD_BLACKLIST_ITEM,
		payload: item
	}
}

export function removeBlacklistItem(item: BlacklistItem): RemoveBlacklistAction {
	return {
		type: BlacklistActions.REMOVE_BLACKLIST_ITEM,
		payload: item
	}
}

export function removeLastBlacklistItem(): RemoveLastBlacklistItemAction {
	return {
		type: BlacklistActions.REMOVE_LAST_BLACKLIST_ITEM
	}
}

export function setBlacklist(blacklist: BlacklistItem[] = defaultBlacklist): SetBlacklistAction {
	return {
		type: BlacklistActions.SET_BLACKLIST,
		payload: blacklist
	}
}

export const defaultBlacklist: BlacklistItem[] = []
