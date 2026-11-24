import { hierarchy } from "d3-hierarchy"

import { CodeMapNode } from "../../model/codeCharta.model"
import { createRuleMatcher, parseNodeRule, transformPath } from "./gitignorePattern"
import { compileSearchQuery } from "./searchQuery"

export function getNodesBySearchQuery(root: CodeMapNode, query: string): CodeMapNode[] {
    const rule = compileSearchQuery(query)
    if (rule === "" || !root) {
        return []
    }
    const matches = createRuleMatcher(parseNodeRule(rule))
    const searchedNodes: CodeMapNode[] = []
    for (const { data } of hierarchy(root)) {
        if (matches(transformPath(data.path))) {
            searchedNodes.push(data)
        }
    }
    return searchedNodes
}
