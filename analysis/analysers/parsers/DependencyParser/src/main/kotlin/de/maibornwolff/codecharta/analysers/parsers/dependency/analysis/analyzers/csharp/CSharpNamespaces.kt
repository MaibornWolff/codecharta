package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

/**
 * Rule 3 of `csharp.md`: each namespace a name is written in, from the innermost outwards to the global one, its own
 * types before the types the using directives of its declaration import, of which two make the name ambiguous.
 */
internal class CSharpNamespaces(private val innermost: List<String>, dependencies: Set<Dependency>) {
    private val usings = dependencies.filter { it.isWildcard && it.scope != null }

    fun find(candidates: List<Path>): Path? {
        for (namespace in outwards()) {
            candidates.firstOrNull { it.withoutName() == namespace }?.let { return it }
            val importedNamespaces = importedIn(namespace)
            val importedTypes = candidates.filter { it.withoutName() in importedNamespaces }.distinctBy { it.withDots() }
            if (importedTypes.isNotEmpty()) return importedTypes.singleOrNull()
        }
        return null
    }

    private fun outwards(): List<List<String>> = (innermost.size downTo 0).map { innermost.take(it) }

    private fun importedIn(namespace: List<String>): List<List<String>> = usings.filter { it.scope == namespace }.map { it.path.parts }
}
