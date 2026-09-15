import { BlacklistItem, BlacklistType } from "../../model/codeCharta.model"
import { unifyWildCard } from "./unifyWildCard"

export const parseBlacklistItems = (blacklistType: BlacklistType, searchPattern: string) => {
    const blacklistItems: BlacklistItem[] = []
    const paths: string[] = searchPattern.split(",")
    if (paths[0].startsWith("!")) {
        paths[0] = paths[0].slice(1)
        for (const path of paths) {
            if (path.length > 0) {
                blacklistItems.push({ path: `!${unifyWildCard(path)}`, type: blacklistType })
            }
        }
    } else {
        for (const path of paths) {
            if (path.startsWith("!")) {
                break
            }
            if (path.length > 0) {
                blacklistItems.push({ path: unifyWildCard(path), type: blacklistType })
            }
        }
    }
    return blacklistItems
}
