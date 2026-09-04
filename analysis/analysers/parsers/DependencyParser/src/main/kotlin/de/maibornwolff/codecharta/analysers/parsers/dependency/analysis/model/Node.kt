package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

data class Node(
    val pathWithName: Path,
    val physicalPath: String,
    val nodeType: NodeType,
    val language: SupportedLanguage,
    val dependencies: Set<Dependency>,
    val usedTypes: Set<Type>,
    val resolvedNodeDependencies: NodeDependencies = NodeDependencies(setOf(), setOf())
) {
    fun resolveTypes(
        projectDictionary: Map<String, List<Path>>,
        languageDictionary: Map<String, Path>,
        internalNodePaths: Set<String>
    ): Node {
        val resolvedUsedTypes = usedTypes.map { it.toResolvedType(projectDictionary, languageDictionary) }.toSet()

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

    private fun Type.toResolvedType(projectDictionary: Map<String, List<Path>>, languageDictionary: Map<String, Path>): Type {
        val resolvedPath = resolveTypeImport(name, projectDictionary, languageDictionary)
        return copy(
            name = name.split(".").last(),
            genericTypes = genericTypes.map { it.toResolvedType(projectDictionary, languageDictionary) },
            resolvedPath = resolvedPath
        )
    }

    private fun resolveTypeImport(
        fullName: String,
        projectDictionary: Map<String, List<Path>>,
        languageDictionary: Map<String, Path>
    ): Path {
        val plainTypeName = fullName.split(".").last()
        // Exclude self-references to prevent REEXPORT nodes from depending on themselves
        val possibleImports = projectDictionary[plainTypeName]?.filter { it != pathWithName }

        // First check if this type is in the same package
        if (possibleImports != null) {
            val currentPackage = pathWithName.withoutName()
            val samePackageType = possibleImports.find { it.withoutName() == currentPackage }
            if (samePackageType != null) {
                return samePackageType
            }
        }

        val directImports = dependencies
            .filter { it.isWildcard.not() && it.isDotImport.not() && it.path.parts.lastOrNull() == plainTypeName }
            .filter { possibleImports?.contains(it.path) ?: true }
        if (directImports.isNotEmpty()) {
            return directImports.first().path
        }
        if (possibleImports != null) {
            // Check dot imports first - they make unqualified types available
            val dotImports = dependencies.filter { it.isDotImport }.map { it.path }
            dotImports.forEach { dotImport ->
                possibleImports.find { it.withoutName() == dotImport.parts }?.let {
                    return@resolveTypeImport it
                }
            }
            val fullPath = Path(fullName.split("."))
            val wildcards = dependencies.filter { it.isWildcard }.map { it.path }
            wildcards.forEach { path ->
                val possiblematch = Path(path.parts + fullPath.parts)
                possibleImports.find { it.withDots() == possiblematch.withDots() }?.let {
                    return@resolveTypeImport it
                }
            }

            wildcards.forEach { wildcardImport ->
                possibleImports.find { it.withoutName() == wildcardImport.parts }?.let {
                    return@resolveTypeImport it
                }
            }

            if (fullPath.hasOnlyName()) {
                wildcards.forEach { wildcard ->
                    // TODO: i think contains is not enough or might lead to false positives. It would be better to move the wildcard as a sliding window over the possibleimport
                    possibleImports
                        .firstOrNull { it.withDots().contains(wildcard.withDots()) }
                        ?.let { return@resolveTypeImport it }
                }
            }

            possibleImports.find { it.withDots() == fullName }?.let { return@resolveTypeImport it }

            // Generic module resolution - works for all languages with complex import paths
            resolveComplexModuleImport(possibleImports)?.let { return it }
        }

        val foundInWithAlias = dependencies.mapNotNull { dependency ->
            possibleImports?.firstOrNull { it.hasAlias(dependency.path) }
        }
        if (foundInWithAlias.isNotEmpty()) {
            return foundInWithAlias.first()
        }

        return languageDictionary[plainTypeName] ?: Path.unknown(plainTypeName)
    }

    private fun resolveComplexModuleImport(possibleImports: List<Path>): Path? {
        val packageImports = dependencies.filter { !it.isWildcard && !it.isDotImport }
        packageImports.forEach { packageImport ->
            val matchingType = possibleImports.find { typePath ->
                val typePackage = typePath.withoutName()
                val importPath = packageImport.path.parts

                // Exact match: import path equals type package
                if (typePackage == importPath) {
                    return@find true
                }

                // Suffix match: import path contains the type package as a continuous suffix
                // e.g., "com.company.project.domain.models" matches "domain.models"
                // Only allow suffix matching for multi-element type packages to prevent false matches
                // Single-element packages like "api" should not match "github.com/otherproject/api"
                if (importPath.size > typePackage.size &&
                    typePackage.size > 1 &&
                    // Disable suffix matching for single-element packages
                    importPath.takeLast(typePackage.size) == typePackage
                ) {
                    return@find true
                }

                false
            }
            if (matchingType != null) {
                return matchingType
            }
        }
        return null
    }
}
