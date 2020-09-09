import { BlacklistItem } from "../../../../codeCharta.model"
import { BlacklistAction, BlacklistActions, setBlacklist } from "./blacklist.actions"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
import { clone } from "../../../../util/clone"

export function blacklist(state: BlacklistItem[] = setBlacklist().payload, action: BlacklistAction): BlacklistItem[] {
	switch (action.type) {
		case BlacklistActions.ADD_BLACKLIST_ITEM:
			return addItemToArray(state, action.payload)
		case BlacklistActions.REMOVE_BLACKLIST_ITEM:
			return removeItemFromArray(state, action.payload)
		case BlacklistActions.REMOVE_LAST_BLACKLIST_ITEM:
			return removeItemFromArray(state, state[state.length - 1])
		case BlacklistActions.SET_BLACKLIST:
			return clone(action.payload)
		default:
			return state
	}
}
