import { BlacklistAction, BlacklistActions, setBlacklist } from "./blacklist.actions"
import { Blacklist } from "../../../../model/blacklist"

export function blacklist(state: Blacklist = setBlacklist().payload, action: BlacklistAction): Blacklist {
	switch (action.type) {
		case BlacklistActions.ADD_BLACKLIST_ITEM: {
			state.addBlacklistItem(action.payload)
			return state
		}
		case BlacklistActions.REMOVE_BLACKLIST_ITEM: {
			state.removeBlacklistItem(action.payload)
			return state
		}
		case BlacklistActions.SET_BLACKLIST: {
			state.setBlacklist(action.payload.getItems())
			return state
		}
		default:
			return state
	}
}
