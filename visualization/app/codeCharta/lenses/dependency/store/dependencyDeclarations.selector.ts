import { createSelector } from "@ngrx/store"
import { CCFile, DependencyDeclarationData, DependencyLeaf, DependencyLeafEdge, DependencyNamespace } from "../../../model/codeCharta.model"
import { getCCFiles, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { getUpdatedPath } from "../../../util/nodePathHelper"

export type DependencyDeclarations = Required<DependencyDeclarationData>

export const PACKAGE_SEPARATOR = "."

export const dependencyDeclarationsSelector = createSelector(visibleFileStatesSelector, visibleFileStates =>
    mergeDependencyDeclarations(getCCFiles(visibleFileStates), isPartialState(visibleFileStates))
)

export const hasDeclarationsSelector = createSelector(dependencyDeclarationsSelector, declarations =>
    Object.values(declarations.leaves).some(leavesOfFile => Object.keys(leavesOfFile).length > 0)
)

export const hasPackagesSelector = createSelector(
    dependencyDeclarationsSelector,
    declarations => Object.keys(declarations.namespaces).length > 0
)

/** Several maps side by side each sit in a folder named after their file, so their paths and their packages take
 * that name in front, as `ccsh merge --large` writes them: two maps declaring the same package stay apart. */
function mergeDependencyDeclarations(files: CCFile[], withFileNamePrefix: boolean): DependencyDeclarations {
    const merged: DependencyDeclarations = { namespaces: {}, leaves: {}, leafEdges: [] }
    for (const file of files) {
        const declarations = file.settings.fileSettings.dependencyDeclarations ?? {}
        const isPrefixed = withFileNamePrefix && files.length > 1
        const pathOf = (path: string) => (isPrefixed ? getUpdatedPath(file.fileMeta.fileName, path) : path)
        const namespaceOf = (key: string) => (isPrefixed ? `${file.fileMeta.fileName}${PACKAGE_SEPARATOR}${key}` : key)
        addNamespaces(merged.namespaces, declarations.namespaces ?? {}, namespaceOf)
        addLeaves(merged.leaves, declarations.leaves ?? {}, pathOf, namespaceOf)
        // Not spread into push(): a large map's edges would be more arguments than a call can take.
        for (const leafEdge of declarations.leafEdges ?? []) {
            merged.leafEdges.push(repathed(leafEdge, pathOf))
        }
    }
    return merged
}

type Rename = (name: string) => string

function addNamespaces(merged: Record<string, DependencyNamespace>, namespaces: Record<string, DependencyNamespace>, namespaceOf: Rename) {
    for (const [key, namespace] of Object.entries(namespaces)) {
        merged[namespaceOf(key)] = namespace.parent === undefined ? namespace : { ...namespace, parent: namespaceOf(namespace.parent) }
    }
}

function addLeaves(
    merged: DependencyDeclarations["leaves"],
    leaves: DependencyDeclarations["leaves"],
    pathOf: Rename,
    namespaceOf: Rename
) {
    for (const [path, leavesOfFile] of Object.entries(leaves)) {
        const renamed = Object.entries(leavesOfFile).map(([key, leaf]) => [key, inNamespace(leaf, namespaceOf)])
        merged[pathOf(path)] = { ...merged[pathOf(path)], ...Object.fromEntries(renamed) }
    }
}

function inNamespace(leaf: DependencyLeaf, namespaceOf: Rename): DependencyLeaf {
    return leaf.namespace === undefined ? leaf : { ...leaf, namespace: namespaceOf(leaf.namespace) }
}

function repathed(edge: DependencyLeafEdge, pathOf: Rename): DependencyLeafEdge {
    return { ...edge, fromNodeName: pathOf(edge.fromNodeName), toNodeName: pathOf(edge.toNodeName) }
}
