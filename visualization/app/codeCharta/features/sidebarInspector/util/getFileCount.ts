import { CodeMapNode, FileCount } from "../../../codeCharta.model"

export const getFileCount = (node?: Pick<CodeMapNode, "attributes" | "fileCount">): FileCount | undefined => {
    if (!node) {
        return undefined
    }
    return {
        all: node.attributes?.unary ?? 0,
        added: node.fileCount?.added ?? 0,
        removed: node.fileCount?.removed ?? 0,
        changed: node.fileCount?.changed ?? 0
    }
}
