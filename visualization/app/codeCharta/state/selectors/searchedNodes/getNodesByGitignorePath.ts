import { hierarchy } from "d3-hierarchy"

import { CodeMapNode } from "../../../codeCharta.model"
import { returnIgnore, transformPath } from "../../../util/codeMapHelper"

export function getNodesByGitignorePath(root: CodeMapNode, gitignorePath: string): CodeMapNode[] {
    gitignorePath = gitignorePath.trimStart()
    if (gitignorePath.length === 0 || !root) {
        return []
    }
    const ignoreResults = returnIgnore(gitignorePath)
    const filtered = []
    for (const { data } of hierarchy(root)) {
        if (ignoreResults.ignoredNodePaths.ignores(transformPath(data.path)) === ignoreResults.condition) {
            filtered.push(data)
        }
    }
    return filtered
}
