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
        return DeclarationNames { name ->
            when {
                name.contains(QUALIFIER_SEPARATOR) -> resolver.resolve(name)
                nestedTypes.isOwnName(name) -> resolver.resolveOwnName(name)
                else -> nestedTypes.memberNamed(name) ?: inNamespaces(name)
            }
        }
    }

    private fun resolveInNamespaces(name: String, resolver: TypeImportResolver, namespaces: CSharpNamespaces, project: ProjectNames): Path =
        resolver.candidatesNamed(name)?.let { namespaces.find(it) } ?: project.languageDictionary[name] ?: Path.unknown(name)

    override fun afterResolution(nodes: List<Node>): List<Node> = CSharpImplementedInterfaces.mark(nodes)
}
