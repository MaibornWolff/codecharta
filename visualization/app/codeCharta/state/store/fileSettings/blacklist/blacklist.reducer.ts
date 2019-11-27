import { BlacklistItem } from "../../../../codeCharta.model"
import { BlacklistAction, BlacklistActions } from "./blacklist.actions"
import { removeItemFromArray } from "../../../../util/reduxHelper"

export function blacklist(state: BlacklistItem[] = [], action: BlacklistAction): BlacklistItem[] {
	switch (action.type) {
		case BlacklistActions.ADD_BLACKLIST_ITEM:
			return [...state, action.payload]
		case BlacklistActions.REMOVE_BLACKLIST_ITEM:
			return removeItemFromArray(state, action.payload)
		case BlacklistActions.SET_BLACKLIST:
			return [...action.payload]
		default:
			return state
	}
}
