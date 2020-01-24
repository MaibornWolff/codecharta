import { BlacklistItem } from "../../../../model/codeCharta.model"
import { BlacklistAction, setBlacklist } from "./blacklist.actions"

export function splitBlacklistAction(payload: BlacklistItem[]): BlacklistAction {
	return setBlacklist(payload)
}
