import { BlacklistAction, setBlacklist } from "./blacklist.actions"
import { Blacklist } from "../../../../model/blacklist"

export function splitBlacklistAction(payload: Blacklist): BlacklistAction {
	return setBlacklist(payload)
}
