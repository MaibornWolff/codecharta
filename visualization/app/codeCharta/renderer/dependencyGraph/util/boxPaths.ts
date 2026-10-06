export function isWithin(path: string, folderPath: string): boolean {
    return path === folderPath || path.startsWith(`${folderPath}/`)
}

/** A file has no children in the file tree, so no path of the map can take the one a declaration gets below it. */
export function declarationPathOf(filePath: string, leafKey: string): string {
    return `${filePath}/${leafKey}`
}
