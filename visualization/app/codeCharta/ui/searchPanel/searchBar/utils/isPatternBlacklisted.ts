import { BlacklistItem, BlacklistType } from "../../../../codeCharta.model"
import { unifyWildCard } from "./unifyWildCard"

export const isPatternBlacklisted = (blacklist: BlacklistItem[], blacklistType: BlacklistType, searchPattern: string) => {
    const paths: string[] = searchPattern.trim().split(",")
    if (searchPattern.trim().startsWith("!")) {
        paths[0] = paths[0].slice(1)
        for (const path of paths) {
            const pathNew = `!${unifyWildCard(path)}`
            if (blacklist.some(x => pathNew === x.path && blacklistType === x.type)) {
                return true
            }
        }
        return false
    }
    for (const path of paths) {
        if (blacklist.some(x => unifyWildCard(path) === x.path && blacklistType === x.type)) {
            return true
        }
    }
    return false
}
