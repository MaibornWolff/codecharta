import { BlacklistItem } from "../../../../codeCharta.model"
import { setBlacklist } from "./blacklist.actions"

export function splitBlacklistAction(payload: BlacklistItem[]) {
	return setBlacklist(payload)
}
