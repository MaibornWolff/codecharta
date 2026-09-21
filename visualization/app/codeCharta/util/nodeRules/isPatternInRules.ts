import { NodeRule } from "../../model/codeCharta.model"
import { unifyWildCard } from "./unifyWildCard"

/** Whether a search pattern is already held, rule for rule, by the given list. */
export const isPatternInRules = (nodeRules: NodeRule[], searchPattern: string) => {
    const paths: string[] = searchPattern.trim().split(",")
    if (searchPattern.trim().startsWith("!")) {
        paths[0] = paths[0].slice(1)
        return paths.some(path => nodeRules.some(rule => `!${unifyWildCard(path)}` === rule.path))
    }
    return paths.some(path => nodeRules.some(rule => unifyWildCard(path) === rule.path))
}
