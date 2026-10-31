import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"

const SURROUNDING_QUOTES = /^(["'])(.*)\1$/
const ABSOLUTE_FOLDER_PATH = /^(\/|[a-zA-Z]:[\\/]|\\\\)/

/** With several maps visible, each map's files sit below a folder named after the map file. */
export function relativePathOf(nodePath: string, mapFolderName: string | null = null): string {
    const segments = nodePath
        .slice(fileRoot.rootPath.length)
        .split("/")
        .filter(segment => segment !== "")
    if (mapFolderName !== null && segments[0] === mapFolderName) {
        segments.shift()
    }
    return segments.join("/")
}

export function mapNameOf(mapFileName: string): string {
    return mapFileName.replace(/(\.cc)?\.json(\.gz)?$/, "")
}

/** Windows' "Copy as path" puts quotes around the path. */
export function cleanedFolderPath(input: string): string {
    return input.trim().replace(SURROUNDING_QUOTES, "$2").trim()
}

export function isAbsoluteFolderPath(path: string): boolean {
    return ABSOLUTE_FOLDER_PATH.test(path)
}

export function vscodeFileLink(editorRootPath: string, relativePath: string): string {
    const withForwardSlashes = cleanedFolderPath(editorRootPath).replaceAll("\\", "/")
    const rootPath = withForwardSlashes
        .split("/")
        .filter(segment => segment !== "")
        .join("/")
    const networkPathStart = withForwardSlashes.startsWith("//") ? "/" : ""
    const fullPath = `${networkPathStart}${rootPath}/${relativePath}`
    const encodedPath = encodeURI(fullPath).replaceAll("#", "%23").replaceAll("?", "%3F")
    return `vscode://file/${encodedPath}`
}

/** Spread over the whole map: the files at the top, such as a README, are in nearly every project. */
export function sampleFilePaths(root: CodeMapNode, sampleSize: number): string[] {
    const paths = filePathsNearestFirst(root)
    if (paths.length <= sampleSize) {
        return paths
    }
    return Array.from({ length: sampleSize }, (_, index) => paths[Math.floor((index * paths.length) / sampleSize)])
}

function filePathsNearestFirst(root: CodeMapNode): string[] {
    const paths: string[] = []
    const pending: Array<{ node: CodeMapNode; path: string }> = (root.children ?? []).map(child => ({ node: child, path: child.name }))
    for (const { node, path } of pending) {
        if (node.type === NodeType.FILE) {
            paths.push(path)
        } else {
            pending.push(...(node.children ?? []).map(child => ({ node: child, path: `${path}/${child.name}` })))
        }
    }
    return paths
}
