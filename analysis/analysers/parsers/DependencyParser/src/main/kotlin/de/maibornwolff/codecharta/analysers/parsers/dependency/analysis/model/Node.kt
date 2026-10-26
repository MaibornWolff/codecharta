package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/**
 * @property angular what the Angular decorator of the class declares or the elements of a template, null for other nodes
 * @property isFileScoped whether only its own file can name it, as a Kotlin `private` top-level declaration
 * @property isImplementationPart whether it is the part of a C++ class another file implements, which depends on the
 *   class of its own path (`cpp.md`, decision 3)
 */
data class Node(
    val pathWithName: Path,
    val physicalPath: String,
    val nodeType: NodeType,
    val language: SupportedLanguage,
    val dependencies: Set<Dependency>,
    val usedTypes: Set<Type>,
    val resolvedNodeDependencies: NodeDependencies = NodeDependencies(setOf(), setOf()),
    val angular: AngularMetadata? = null,
    val isFileScoped: Boolean = false,
    val isImplementationPart: Boolean = false
) {
    fun name() = pathWithName.parts.last()

    // Kept so tests can hang a builder off it, the way the generated serializer companion used to serve.
    companion object
}
