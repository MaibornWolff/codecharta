export function isWithin(path: string, folderPath: string): boolean {
    return path === folderPath || path.startsWith(`${folderPath}/`)
}
