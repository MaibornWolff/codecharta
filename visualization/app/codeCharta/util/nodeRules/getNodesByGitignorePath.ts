import { hierarchy } from "d3-hierarchy"

import { CodeMapNode } from "../../model/codeCharta.model"
import { createRuleMatcher, parseNodeRule, transformPath } from "./gitignorePattern"

export function getNodesByGitignorePath(root: CodeMapNode, gitignorePath: string): CodeMapNode[] {
    gitignorePath = gitignorePath.trimStart()
    if (gitignorePath.length === 0 || !root) {
        return []
    }
    const matches = createRuleMatcher(parseNodeRule(gitignorePath))
    const filtered = []
    for (const { data } of hierarchy(root)) {
        if (matches(transformPath(data.path))) {
            filtered.push(data)
        }
    }
    return filtered
}
