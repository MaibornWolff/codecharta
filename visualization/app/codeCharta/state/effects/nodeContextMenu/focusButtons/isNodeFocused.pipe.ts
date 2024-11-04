import { Pipe, PipeTransform } from "@angular/core"

import { CodeMapNode } from "../../../../codeCharta.model"

type IsNodeFocusedType = {
    isNodeFocused: boolean
    isParentFocused: boolean
}

@Pipe({ name: "isNodeFocused" })
export class IsNodeFocusedPipe implements PipeTransform {
    transform(focusedNodePath: string | undefined, node: Pick<CodeMapNode, "path">): IsNodeFocusedType {
        if (!focusedNodePath || !node) {
            return {
                isNodeFocused: false,
                isParentFocused: false
            }
        }

        const isNodeFocused = focusedNodePath === node.path
        return {
            isNodeFocused,
            isParentFocused: !isNodeFocused && node.path.startsWith(focusedNodePath)
        }
    }
}
