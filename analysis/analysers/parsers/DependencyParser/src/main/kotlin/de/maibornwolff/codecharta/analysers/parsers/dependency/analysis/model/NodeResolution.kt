package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/** The node with every used type resolved by the name rules of its language, and the dependencies that follow. */
fun Node.resolveTypes(
    projectDictionary: Map<String, List<Path>>,
    languageDictionary: Map<String, Path>,
    internalNodePaths: Set<String>,
    fileScopedPaths: FileScopedPaths = FileScopedPaths.NONE,
    nameRules: NameRules = DefaultNameRules
): Node {
    val names = nameRules.namesOf(this, ProjectNames(projectDictionary, languageDictionary, internalNodePaths, fileScopedPaths))
    val resolvedUsedTypes = usedTypes.map { it.toResolvedType(names) }.toSet()

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

private fun Type.toResolvedType(names: DeclarationNames): Type = copy(
    name = name.split(".").last(),
    genericTypes = genericTypes.map { it.toResolvedType(names) },
    resolvedPath = names.resolve(name)
)
