import { NodeRule } from "../../model/codeCharta.model"
import { compileSearchQuery } from "./searchQuery"

/** Whether the rule a search pattern stands for is already in the given list. */
export const isPatternInRules = (nodeRules: NodeRule[], searchPattern: string) => {
    const rulePath = compileSearchQuery(searchPattern)
    return nodeRules.some(rule => rule.path === rulePath)
}
