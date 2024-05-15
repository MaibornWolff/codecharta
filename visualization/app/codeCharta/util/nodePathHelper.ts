import { fileRoot } from "../services/loadFile/fileRoot"

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
