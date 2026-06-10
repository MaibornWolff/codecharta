import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { CCFile, CodeMapNode } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { BlacklistMatcher, isLeaf } from "../../../util/codeMapHelper"

export const resultsInEmptyMap = (visibleFiles: FileState[], matcher: BlacklistMatcher) => {
    for (const { file } of visibleFiles) {
        if (!resultsInEmptyFile(file, matcher)) {
            return false
        }
    }
    return true
}

const resultsInEmptyFile = (file: CCFile, matcher: BlacklistMatcher) => {
    for (const node of hierarchy(file.map)) {
        if (isNodeIncluded(node, matcher)) {
            return false
        }
    }
    return true
}

const isNodeIncluded = (node: HierarchyNode<CodeMapNode>, matcher: BlacklistMatcher) =>
    isLeaf(node) && node.data.path && !matcher.isExcludedLeaf(node.data.path)
