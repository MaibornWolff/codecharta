package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.AngularDeclaration

/**
 * A template names a component by its selector and a pipe by its pipe name, which only the class declaring it knows.
 * Each such name of a template is rewritten to the full path of the class it means, so it resolves like any type
 * written with its full path. A name one class declares means that class. A name several classes declare means the one
 * in the scope of the template's component, as Angular decides it: the classes the standalone component imports, or the
 * declarations and imports of the module declaring the component and the exports of the modules that one imports. A
 * name the scope does not decide stays unresolved.
 */
internal class AngularTemplateReferences private constructor(nodes: List<Node>) {
    private val declarationsByTemplateName: Map<String, List<Node>> = nodes
        .flatMap { node ->
            node.angular
                ?.declaration
                ?.templateNames
                .orEmpty()
                .map { templateName -> templateName to node }
        }.groupBy({ it.first }, { it.second })
    private val componentsByTemplate: Map<Path, Node> = nodes
        .mapNotNull { node -> node.angular?.templatePath?.let { templatePath -> templatePath to node } }
        .toMap()
    private val modulesByName: Map<String, AngularDeclaration> = nodes
        .mapNotNull { node ->
            node.angular?.declaration?.takeIf { it.declarations.isNotEmpty() || it.exports.isNotEmpty() }?.let { node.name() to it }
        }.toMap()
    private val modules: Collection<AngularDeclaration> = modulesByName.values

    private fun qualify(template: Node): Node = template.copy(
        usedTypes = template.usedTypes
            .map { type ->
                val declaration = declarationOf(type.name, template)
                if (declaration == null) type else type.copy(name = declaration.pathWithName.withDots())
            }.toSet()
    )

    private fun declarationOf(templateName: String, template: Node): Node? {
        val candidates = declarationsByTemplateName[templateName] ?: return null
        if (candidates.size == 1) return candidates.single()
        val component = componentsByTemplate[template.pathWithName] ?: return null
        val scope = scopeOf(component)
        return candidates.singleOrNull { it.name() in scope }
    }

    private fun scopeOf(component: Node): Set<String> {
        val ownImports = component.angular?.declaration?.imports.orEmpty()
        val declaringModules = modules.filter { component.name() in it.declarations }
        val moduleScope = declaringModules.flatMap { module ->
            module.declarations + module.imports + module.imports.flatMap { modulesByName[it]?.exports.orEmpty() }
        }
        return (ownImports + moduleScope).toSet()
    }

    companion object {
        fun qualify(nodes: List<Node>): List<Node> {
            if (nodes.none { it.angular != null }) return nodes
            val references = AngularTemplateReferences(nodes)
            return nodes.map { node -> if (node.language == SupportedLanguage.ANGULAR) references.qualify(node) else node }
        }
    }
}
