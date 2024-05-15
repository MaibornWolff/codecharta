import { FileState } from "../model/files/files"
import { CCFile, CodeMapNode, NodeType } from "../codeCharta.model"

export function createFileStateWithNodes(children: CodeMapNode[]) {
    const map: CodeMapNode = { name: "root", type: NodeType.FOLDER, children }
    const file: CCFile = { fileMeta: undefined, map, settings: { fileSettings: undefined } }
    return { file, selectedAs: undefined } as FileState
}
