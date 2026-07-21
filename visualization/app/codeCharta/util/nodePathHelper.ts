import { fileRoot } from "./fileRoot"

export function getUpdatedBlacklistItemPath(fileName: string, path: string) {
    if (isAbsoluteRootPath(path)) {
        return getUpdatedPath(fileName, path)
    }
    return path
}

export function getUpdatedPath(fileName: string, path: string) {
    const length = fileRoot.rootPath.length + 1
    const end = path.length <= length ? "" : `/${path.slice(length)}`
    return `${fileRoot.rootPath}/${fileName}${end}`
}

function isAbsoluteRootPath(path: string) {
    return path.startsWith(`${fileRoot.rootPath}/`)
}

export function getTopLevelMapName(path: string) {
    if (!isAbsoluteRootPath(path)) {
        return path
    }
    const start = fileRoot.rootPath.length + 1
    const end = path.indexOf("/", start)
    return end === -1 ? path.slice(start) : path.slice(start, end)
}

/**
 * The display name of a node path: its last non-empty segment, or `fallback` when the path is null or has
 * no usable segment. Single-sources the "leaf name of a path" idiom shared by the domain view (collapsed
 * explorer name) and the word-cloud renderer (empty-state name), which had drifted to different fallbacks.
 */
export function pathToNodeName(path: string | null, fallback: string): string {
    if (path === null) {
        return fallback
    }
    return path.split("/").filter(Boolean).at(-1) ?? fallback
}

export function getParent<T>(hashMap: Map<string, T>, path: string): T {
    do {
        // TODO: Check what happens with Windows paths.
        path = path.slice(0, path.lastIndexOf("/"))

        const node = hashMap.get(path)
        if (node) {
            return node
        }
    } while (path !== fileRoot.rootPath && path.length > 0)
}
