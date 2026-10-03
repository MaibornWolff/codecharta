export function isInsideFolder(nodePath: string, folderPath: string): boolean {
    return nodePath === folderPath || nodePath.startsWith(`${folderPath}/`)
}
