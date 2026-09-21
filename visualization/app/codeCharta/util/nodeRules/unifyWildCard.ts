export const unifyWildCard = (path: string): string => {
    path = path.trim()
    if (path.startsWith("*") || path.endsWith("*")) {
        return path
    }
    if (path.startsWith("/") || path.startsWith("./")) {
        return path
    }
    if (!path.startsWith('"') && !path.endsWith('"')) {
        return path.startsWith("!") ? path : `*${path}*`
    }
    return path
}
