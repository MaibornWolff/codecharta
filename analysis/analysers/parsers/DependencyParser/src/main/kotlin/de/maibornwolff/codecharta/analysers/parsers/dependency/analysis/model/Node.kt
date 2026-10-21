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
        val followsJavaRules = language.nameScope == SupportedLanguage.JAVA
        val ownPackage = if (followsJavaRules) packageOf(internalNodePaths) else pathWithName.withoutName()
        val resolver =
            TypeImportResolver(
                ImportingDeclaration(pathWithName, dependencies, language, ownPackage),
                projectDictionary,
                languageDictionary
            )
        val memberTypes = if (followsJavaRules) memberTypeScopes(resolver, internalNodePaths, projectDictionary) else MemberTypeScopes.NONE
        val qualifiedNames = if (followsJavaRules) QualifiedNames(resolver, memberTypes, internalNodePaths) else null
        val resolvedUsedTypes = usedTypes.map { it.toResolvedType(resolver, memberTypes, qualifiedNames) }.toSet()

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
    companion object {
        private const val QUALIFIER_SEPARATOR = "."
        private val SUPERTYPE_USAGES = setOf(TypeOfUsage.INHERITANCE, TypeOfUsage.IMPLEMENTATION)
    }

    // The path without the declarations around it
    private fun packageOf(internalNodePaths: Set<String>): List<String> {
        var parts = pathWithName.withoutName()
        while (parts.isNotEmpty() && Path(parts).withDots() in internalNodePaths) parts = parts.dropLast(1)
        return parts
    }

    private fun memberTypeScopes(
        resolver: TypeImportResolver,
        internalNodePaths: Set<String>,
        projectDictionary: Map<String, List<Path>>
    ): MemberTypeScopes {
        val supertypes = usedTypes.filter { it.usageSource in SUPERTYPE_USAGES }.map { resolver.resolve(it.name) }
        return MemberTypeScopes.of(pathWithName, supertypes, internalNodePaths, projectDictionary)
    }

    private fun Type.toResolvedType(resolver: TypeImportResolver, memberTypes: MemberTypeScopes, qualifiedNames: QualifiedNames?): Type =
        copy(
            name = name.split(".").last(),
            genericTypes = genericTypes.map { it.toResolvedType(resolver, memberTypes, qualifiedNames) },
            resolvedPath = when {
                name.contains(QUALIFIER_SEPARATOR) -> qualifiedNames?.resolve(name) ?: resolver.resolve(name)
                memberTypes.isOwnName(name) -> resolver.resolveOwnName(name)
                else -> memberTypes.memberNamed(name) ?: resolver.resolve(name)
            }
        )
}
