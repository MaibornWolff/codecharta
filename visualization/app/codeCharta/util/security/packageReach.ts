import { ExternalImport, SecurityData } from "../../model/codeCharta.model"

type NameIndex = Map<string, Map<string, string[]>>

/** Every package a key leads to through `dependsOn`, the keys themselves included. */
function reachablePackages(security: SecurityData, startKeys: Iterable<string>): Set<string> {
    const reached = new Set<string>()
    const pending = [...startKeys]
    while (pending.length > 0) {
        const key = pending.pop()
        if (reached.has(key) || !security.packages[key]) {
            continue
        }
        reached.add(key)
        pending.push(...(security.packages[key].dependsOn ?? []))
    }
    return reached
}

/**
 * The packages the imports of one file name, each from the lockfile nearest to the file that declares it, or from
 * any lockfile when none above the file does.
 */
function importedPackages(security: SecurityData, filePath: string, imports: ExternalImport[], index = indexByName(security)): string[] {
    const lockfilesAbove = lockfilesAboveNearestFirst(security, filePath)
    const keys = new Set<string>()
    for (const externalImport of imports) {
        const candidates = candidatesOf(index, externalImport)
        const nearest = lockfilesAbove
            .map(path => candidates.filter(key => security.lockfiles[path].declares.includes(key)))
            .find(found => found.length > 0)
        for (const key of nearest ?? candidates) {
            keys.add(key)
        }
    }
    return [...keys].sort()
}

/** The packages each importing file reaches, keyed by the file's path. */
export function packagesReachedByFile(security: SecurityData): Record<string, Set<string>> {
    const index = indexByName(security)
    const reached: Record<string, Set<string>> = {}
    for (const [filePath, imports] of Object.entries(security.externalImports)) {
        const found = reachablePackages(security, importedPackages(security, filePath, imports, index))
        if (found.size > 0) {
            reached[filePath] = found
        }
    }
    return reached
}

function indexByName(security: SecurityData): NameIndex {
    const index: NameIndex = new Map()
    for (const [key, { ecosystem, name }] of Object.entries(security.packages)) {
        if (!ecosystem) {
            continue
        }
        const byName = index.get(ecosystem) ?? new Map<string, string[]>()
        const normalized = normalizedName(ecosystem, name)
        byName.set(normalized, [...(byName.get(normalized) ?? []), key])
        index.set(ecosystem, byName)
    }
    return index
}

// A Go import names a package inside a module, so the module is the longest package name it starts with
function candidatesOf(index: NameIndex, { ecosystem, name }: ExternalImport): string[] {
    const byName = index.get(ecosystem)
    if (!byName) {
        return []
    }
    if (ecosystem !== "golang") {
        return byName.get(normalizedName(ecosystem, name)) ?? []
    }
    const modules = [...byName.keys()].filter(module => name === module || name.startsWith(`${module}/`))
    const longest = modules.sort((first, second) => second.length - first.length)[0]
    return longest ? byName.get(longest) : []
}

function normalizedName(ecosystem: string, name: string): string {
    if (ecosystem === "pypi") {
        return name.toLowerCase().replaceAll(/[-_.]+/g, "-")
    }
    if (ecosystem === "cargo") {
        return name.toLowerCase().replaceAll("-", "_")
    }
    return name
}

function lockfilesAboveNearestFirst(security: SecurityData, filePath: string): string[] {
    return Object.keys(security.lockfiles)
        .filter(lockfilePath => filePath.startsWith(`${folderOf(lockfilePath)}/`))
        .sort((first, second) => folderOf(second).length - folderOf(first).length)
}

function folderOf(path: string): string {
    return path.slice(0, path.lastIndexOf("/"))
}
