import { NodeRule } from "../../model/codeCharta.model"
import { unifyWildCard } from "./unifyWildCard"

/** Turns a search pattern into the rules it stands for. Which list they go into is the caller's. */
export const parseNodeRules = (searchPattern: string) => {
    const nodeRules: NodeRule[] = []
    const paths: string[] = searchPattern.split(",")
    if (paths[0].startsWith("!")) {
        paths[0] = paths[0].slice(1)
        for (const path of paths) {
            if (path.length > 0) {
                nodeRules.push({ path: `!${unifyWildCard(path)}` })
            }
        }
        return nodeRules
    }
    for (const path of paths) {
        if (path.startsWith("!")) {
            break
        }
        if (path.length > 0) {
            nodeRules.push({ path: unifyWildCard(path) })
        }
    }
    return nodeRules
}
