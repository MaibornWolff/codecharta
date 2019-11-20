import { BlacklistItem } from "../../../codeCharta.model"
import { BlacklistAction, BlacklistActions } from "../../actions/blacklist"

export function blacklist(state: BlacklistItem[] = [], action: BlacklistAction): BlacklistItem[] {
	switch (action.type) {
		case BlacklistActions.ADD_BLACKLIST_ITEM:
			return [...state, action.payload]
		default:
			return state
	}
}
