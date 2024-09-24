export function normalizePath(inputPath: string): string {
    if (!inputPath) {
        return
    }
    const parts = inputPath.split("/").reduce<string[]>((accumulator, part) => {
        if (part === "" || part === ".") {
            return accumulator
        }
        if (part === "..") {
            accumulator.pop()
        } else {
            accumulator.push(part)
        }
        return accumulator
    }, [])

    return `/${parts.join("/")}`
}

export function isChildPath(potentialChild: string, potentialParent: string): boolean {
    if (!potentialChild || !potentialParent) {
        return false
    }

    const normalizedChild = normalizePath(potentialChild)
    const normalizedParent = normalizePath(potentialParent)
    const parentPathWithSlash = normalizedParent.endsWith("/") ? normalizedParent : `${normalizedParent}/`

    return normalizedChild.startsWith(parentPathWithSlash)
}
