package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.CSharpStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.CppStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.EmptyStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.GoStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.JavaStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.KotlinStandardLibrary
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries.StandardLibrary

class DependencyResolverService {
    companion object {
        fun resolveNodes(fileReports: Collection<FileReport>): Collection<Node> {
            val nodes = qualifyTemplateReferences(applyRustReexportAliases(fileReports.flatMap { it.nodes }))
            val dictionary = getDictionary(nodes)
            val knownNodePaths = getKnownNodePaths(nodes)
            return nodes.map { it.resolveTypes(dictionary, standardLibraryFor(it.language).get(), knownNodePaths) }
        }

        /**
         * Folds Rust `pub use` re-export forwarding nodes into aliases on their real definition node,
         * then drops the forwarding nodes. A consumer importing the flattened `crate::Type` path then
         * resolves straight to `crate::module::Type` via the alias — instead of through a same-named
         * forwarding node, which would otherwise capture the definition's own self-references and
         * fabricate `crate::Type ↔ crate::module::Type` cycles.
         */
        private fun applyRustReexportAliases(nodes: List<Node>): List<Node> {
            val (reexports, rest) = nodes.partition {
                it.language == SupportedLanguage.RUST && it.nodeType == NodeType.REEXPORT
            }
            if (reexports.isEmpty()) return nodes
            val byPath = rest.associateBy { it.pathWithName.withDots() }
            reexports.forEach { reexport ->
                val target = reexport.dependencies.firstOrNull { !it.isWildcard }?.path ?: return@forEach
                byPath[target.withDots()]?.pathWithName?.withAlias(reexport.pathWithName)
            }
            return rest
        }

        /**
         * A template names a component by its selector and a pipe by its pipe name, which only the class declaring it
         * knows. Each name that exactly one declaration carries is rewritten to the full path of that declaration, so it
         * resolves like any type written with its full path; a name several declarations carry stays unresolved.
         */
        private fun qualifyTemplateReferences(nodes: List<Node>): List<Node> {
            val declarationsByTemplateName = nodes
                .flatMap { node -> node.templateNames.map { templateName -> templateName to node.pathWithName } }
                .groupBy({ it.first }, { it.second })
            if (declarationsByTemplateName.isEmpty()) return nodes
            return nodes.map { node ->
                if (node.language == SupportedLanguage.ANGULAR) node.withQualifiedUsedTypes(declarationsByTemplateName) else node
            }
        }

        private fun Node.withQualifiedUsedTypes(declarationsByTemplateName: Map<String, List<Path>>): Node = copy(
            usedTypes = usedTypes
                .map { type ->
                    val declaration = declarationsByTemplateName[type.name]?.singleOrNull()
                    if (declaration == null) type else type.copy(name = declaration.withDots())
                }.toSet()
        )

        fun mapNodeInfo(node: Node) = NodeInformation(
            id = node.pathWithName.withDots(),
            dependencies = node.resolvedNodeDependencies.internalDependencies
                .map { it.withDots() }
                .toSet()
        )

        fun getDictionary(nodes: List<Node>) = nodes.map { it.pathWithName }.groupBy { it.parts.last() }

        fun getKnownNodePaths(nodes: List<Node>) = nodes.map { it.pathWithName.withDots() }.toSet()

        private fun standardLibraryFor(language: SupportedLanguage): StandardLibrary = when (language) {
            SupportedLanguage.JAVA -> JavaStandardLibrary()
            SupportedLanguage.C_SHARP -> CSharpStandardLibrary()
            SupportedLanguage.TYPESCRIPT -> EmptyStandardLibrary()
            SupportedLanguage.JAVASCRIPT -> EmptyStandardLibrary()
            SupportedLanguage.PHP -> EmptyStandardLibrary()
            SupportedLanguage.GO -> GoStandardLibrary()
            SupportedLanguage.PYTHON -> EmptyStandardLibrary()
            SupportedLanguage.CPP -> CppStandardLibrary()
            SupportedLanguage.KOTLIN -> KotlinStandardLibrary()
            SupportedLanguage.VUE -> EmptyStandardLibrary()
            SupportedLanguage.DELPHI -> EmptyStandardLibrary()
            SupportedLanguage.RUST -> EmptyStandardLibrary()
            SupportedLanguage.ANGULAR -> EmptyStandardLibrary()
        }
    }
}
