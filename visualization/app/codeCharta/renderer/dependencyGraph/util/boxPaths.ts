/** A file has no children in the file tree, so no path of the map can take the one a declaration gets below it. */
export function declarationPathOf(filePath: string, leafKey: string): string {
    return `${filePath}/${leafKey}`
}

const PACKAGE_PATH_PREFIX = "package:"

/** Every path of the map starts with a slash, so none can take the one a package gets. */
export function packagePathOf(packageKey: string): string {
    return `${PACKAGE_PATH_PREFIX}${packageKey}`
}

export function isPackagePath(path: string): boolean {
    return path.startsWith(PACKAGE_PATH_PREFIX)
}

export function packageKeyOf(packagePath: string): string {
    return packagePath.slice(PACKAGE_PATH_PREFIX.length)
}
