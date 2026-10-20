package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/** @property angular what the Angular decorator of the class declares, null for a node without one */
data class Node(
    val pathWithName: Path,
    val physicalPath: String,
    val nodeType: NodeType,
    val language: SupportedLanguage,
    val dependencies: Set<Dependency>,
    val usedTypes: Set<Type>,
    val resolvedNodeDependencies: NodeDependencies = NodeDependencies(setOf(), setOf()),
    val angular: AngularMetadata? = null
) {
    fun resolveTypes(
        projectDictionary: Map<String, List<Path>>,
        languageDictionary: Map<String, Path>,
        internalNodePaths: Set<String>
    ): Node {
        val resolver = TypeImportResolver(pathWithName, dependencies, projectDictionary, languageDictionary)
        val resolvedUsedTypes = usedTypes.map { it.toResolvedType(resolver) }.toSet()

        val resolvedUsedTypesUnique = resolvedUsedTypes
            .flatMap { type -> type.containedTypes() }
            .toSet()

        val resolvedDependencies = resolvedUsedTypesUnique
            .asSequence()
            .filter { it.resolvedPath != null }
            .filter { !languageDictionary.containsValue(it.resolvedPath) }
            .filter { it.resolvedPath != pathWithName }
            .map { Dependency(path = it.resolvedPath!!, type = it.usageSource) }
            .toSet()

        val nodeDependencies = NodeDependencies(
            internalDependencies = resolvedDependencies.filter { internalNodePaths.contains(it.withDots()) }.toSet(),
            externalDependencies = resolvedDependencies
                .filter { internalNodePaths.contains(it.withDots()).not() }
                .toSet()
        )

        return copy(
            dependencies = (resolvedDependencies + dependencies).toSet(),
            usedTypes = resolvedUsedTypes,
            resolvedNodeDependencies = nodeDependencies
        )
    }

    fun name() = pathWithName.parts.last()

    // Kept so tests can hang a builder off it, the way the generated serializer companion used to serve.
    companion object {}

    private fun Type.toResolvedType(resolver: TypeImportResolver): Type = copy(
        name = name.split(".").last(),
        genericTypes = genericTypes.map { it.toResolvedType(resolver) },
        resolvedPath = resolver.resolve(name)
    )
}
