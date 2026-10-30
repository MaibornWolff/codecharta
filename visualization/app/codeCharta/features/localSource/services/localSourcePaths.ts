import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"

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

export function vscodeFileLink(editorRootPath: string, relativePath: string): string {
    const rootPath = editorRootPath
        .trim()
        .replaceAll("\\", "/")
        .replace(/^\/+|\/+$/g, "")
    const fullPath = `${rootPath}/${relativePath}`
    const encodedPath = encodeURI(fullPath).replaceAll("#", "%23").replaceAll("?", "%3F")
    return `vscode://file/${encodedPath}`
}

/** A click on a link: `window.open` would leave an empty tab behind, as nothing ever loads in it. */
export function handLinkToTheSystem(link: string): void {
    const anchor = document.createElement("a")
    anchor.href = link
    anchor.click()
}

export function sampleFilePaths(root: CodeMapNode, sampleSize: number): string[] {
    const samples: string[] = []
    const pending: Array<{ node: CodeMapNode; path: string }> = (root.children ?? []).map(child => ({ node: child, path: child.name }))
    while (pending.length > 0 && samples.length < sampleSize) {
        const { node, path } = pending.shift()
        if (node.type === NodeType.FILE) {
            samples.push(path)
        } else {
            pending.push(...(node.children ?? []).map(child => ({ node: child, path: `${path}/${child.name}` })))
        }
    }
    return samples
}
