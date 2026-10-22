package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ImportingDeclaration
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.MemberTypeScopes
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeImportResolver

/** The name rules of `docs/name-resolution/csharp.md`. */
internal object CSharpNameRules : NameRules {
    private const val QUALIFIER_SEPARATOR = "."
    private const val GLOBAL_NAMESPACE_ALIAS = "global::"

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames {
        val namespace = project.packageOf(node.pathWithName)
        val resolver = TypeImportResolver(
            ImportingDeclaration(node.pathWithName, node.physicalPath, node.dependencies, node.language, namespace),
            project.projectDictionary,
            project.languageDictionary,
            project.fileScopedPaths
        )
        val namespaces = CSharpNamespaces(namespace, node.dependencies)
        val inNamespaces = { name: String -> resolveInNamespaces(name, resolver, namespaces, project) }
        val nestedTypes = MemberTypeScopes.of(node, inNamespaces, project)
        val attributes = CSharpAttributes(project)
        return object : DeclarationNames {
            override fun resolve(writtenName: String): Path = when {
                isQualified(writtenName) -> resolveQualified(writtenName, resolver, namespaces, project)
                nestedTypes.isOwnName(writtenName) -> resolver.resolveOwnName(writtenName)
                else -> nestedTypes.memberNamed(writtenName) ?: inNamespaces(writtenName)
            }

            override fun resolveEither(writtenName: String, alternativeName: String): Path =
                attributes.choose(resolve(writtenName), resolve(alternativeName))
        }
    }

    private fun isQualified(name: String): Boolean = name.contains(QUALIFIER_SEPARATOR) || name.startsWith(GLOBAL_NAMESPACE_ALIAS)

    private fun resolveQualified(name: String, resolver: TypeImportResolver, namespaces: CSharpNamespaces, project: ProjectNames): Path {
        val writtenParts = name.removePrefix(GLOBAL_NAMESPACE_ALIAS).split(QUALIFIER_SEPARATOR)
        val plainName = writtenParts.last()
        val candidates = resolver.candidatesNamed(plainName).orEmpty()
        return namespaces.findQualified(writtenParts, name.startsWith(GLOBAL_NAMESPACE_ALIAS), candidates)
            ?: project.languageDictionary[plainName]
            ?: Path.unknown(plainName)
    }

    private fun resolveInNamespaces(name: String, resolver: TypeImportResolver, namespaces: CSharpNamespaces, project: ProjectNames): Path =
        resolver.candidatesNamed(name)?.let { namespaces.find(it) } ?: project.languageDictionary[name] ?: Path.unknown(name)

    override fun afterResolution(nodes: List<Node>): List<Node> = CSharpImplementedInterfaces.mark(nodes)
}
