package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

internal object DefaultNameRules : NameRules {
    private const val QUALIFIER_SEPARATOR = "."
    private val SUPERTYPE_USAGES = setOf(TypeOfUsage.INHERITANCE, TypeOfUsage.IMPLEMENTATION)

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames {
        val followsJavaRules = node.language.nameScope == SupportedLanguage.JAVA
        val hasNestedTypes = followsJavaRules || node.language == SupportedLanguage.C_SHARP
        val ownPackage = if (hasNestedTypes) node.packageOf(project.internalNodePaths) else node.pathWithName.withoutName()
        val resolver =
            TypeImportResolver(
                ImportingDeclaration(node.pathWithName, node.physicalPath, node.dependencies, node.language, ownPackage),
                project.projectDictionary,
                project.languageDictionary,
                project.fileScopedPaths
            )
        val memberTypes = node.memberTypeScopes(resolver, project)
        val qualifiedNames = if (followsJavaRules) QualifiedNames(resolver, memberTypes, project.internalNodePaths) else null
        return DeclarationNames { name ->
            when {
                name.contains(QUALIFIER_SEPARATOR) -> qualifiedNames?.resolve(name) ?: resolver.resolve(name)
                memberTypes.isOwnName(name) -> resolver.resolveOwnName(name)
                else -> memberTypes.memberNamed(name) ?: resolver.resolve(name)
            }
        }
    }

    // The path without the declarations around it
    private fun Node.packageOf(internalNodePaths: Set<String>): List<String> {
        var parts = pathWithName.withoutName()
        while (parts.isNotEmpty() && Path(parts).withDots() in internalNodePaths) parts = parts.dropLast(1)
        return parts
    }

    private fun Node.memberTypeScopes(resolver: TypeImportResolver, project: ProjectNames): MemberTypeScopes {
        if (language.nameScope != SupportedLanguage.JAVA && language != SupportedLanguage.C_SHARP) return MemberTypeScopes.NONE
        val supertypes = usedTypes.filter { it.usageSource in SUPERTYPE_USAGES }.map { resolver.resolve(it.name) }
        return MemberTypeScopes.of(pathWithName, supertypes, project.internalNodePaths, project.projectDictionary)
    }
}
