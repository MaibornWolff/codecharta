import { BlacklistAction, BlacklistActions, setBlacklist } from "./blacklist.actions"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"

export function blacklist(state = setBlacklist().payload, action: BlacklistAction) {
	switch (action.type) {
		case BlacklistActions.ADD_BLACKLIST_ITEM:
			return addItemToArray(state, action.payload)
		case BlacklistActions.REMOVE_BLACKLIST_ITEM:
			return removeItemFromArray(state, action.payload)
		case BlacklistActions.SET_BLACKLIST:
			return action.payload
		default:
			return state
	}
}
