package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_AMBIENT_MODULE_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_GLOBAL_SEGMENT

/**
 * Where a TypeScript declaration lies, by "Declarations" of `docs/name-resolution/typescript.md`: in the namespaces of
 * its file, in a `declare module` block, which lies outside every file, or in the global scope (rule 3), which TSE
 * marks before the namespaces and which keeps the declaration below its file.
 */
internal object DeclarationScopes {
    fun isAmbient(parentPath: List<String>): Boolean = parentPath.firstOrNull() == TSE_AMBIENT_MODULE_SEGMENT

    fun isGlobal(parentPath: List<String>): Boolean = parentPath.firstOrNull() == TSE_GLOBAL_SEGMENT

    /** The namespaces of its file a declaration lies in; none for a declaration of a `declare module` block. */
    fun namespacesOf(parentPath: List<String>): List<String> = when {
        isAmbient(parentPath) -> emptyList()
        isGlobal(parentPath) -> parentPath.drop(1)
        else -> parentPath
    }
}
