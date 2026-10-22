package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

internal object DefaultNameRules : NameRules {
    private const val QUALIFIER_SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames {
        val followsJavaRules = node.language.nameScope == SupportedLanguage.JAVA
        val ownPackage = if (followsJavaRules) project.packageOf(node.pathWithName) else node.pathWithName.withoutName()
        val resolver =
            TypeImportResolver(
                ImportingDeclaration(node.pathWithName, node.physicalPath, node.dependencies, node.language, ownPackage),
                project.projectDictionary,
                project.languageDictionary,
                project.fileScopedPaths
            )
        val memberTypes = if (followsJavaRules) MemberTypeScopes.of(node, resolver::resolve, project) else MemberTypeScopes.NONE
        val qualifiedNames = if (followsJavaRules) QualifiedNames(resolver, memberTypes, project.internalNodePaths) else null
        return DeclarationNames { name ->
            when {
                name.contains(QUALIFIER_SEPARATOR) -> qualifiedNames?.resolve(name) ?: resolver.resolve(name)
                memberTypes.isOwnName(name) -> resolver.resolveOwnName(name)
                else -> memberTypes.memberNamed(name) ?: resolver.resolve(name)
            }
        }
    }
}
