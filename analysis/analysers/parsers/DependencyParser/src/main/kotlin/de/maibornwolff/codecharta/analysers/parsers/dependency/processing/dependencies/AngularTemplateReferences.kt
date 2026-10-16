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
 *
 * A decorator names classes by their simple name; several classes of that name mean the one the file of the decorator
 * imports, or else the one in that file.
 */
internal class AngularTemplateReferences private constructor(nodes: List<Node>) {
    private val angularNodes = nodes.filter { it.angular != null }
    private val declarationsByTemplateName: Map<String, List<Node>> = angularNodes
        .flatMap { node -> node.angularDeclaration().templateNames.map { templateName -> templateName to node } }
        .groupBy({ it.first }, { it.second })
    private val componentsByTemplate: Map<Path, Node> = angularNodes
        .mapNotNull { node -> node.angular?.templatePath?.let { templatePath -> templatePath to node } }
        .toMap()
    private val classesByName: Map<String, List<Node>> = angularNodes.groupBy { it.name() }
    private val modules: List<Node> = angularNodes.filter { it.angularDeclaration().declarations.isNotEmpty() }

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
        return candidates.singleOrNull { it.pathWithName in scope }
    }

    private fun scopeOf(component: Node): Set<Path> {
        val ownImports = classesNamed(component.angularDeclaration().imports, component)
        val declaringModules = modules.filter { module ->
            classesNamed(module.angularDeclaration().declarations, module).any { it.pathWithName == component.pathWithName }
        }
        val moduleScope = declaringModules.flatMap { module ->
            val declaration = module.angularDeclaration()
            classesNamed(declaration.declarations, module) + classesNamed(declaration.imports, module).flatMap { withExports(it) }
        }
        return (ownImports + moduleScope).mapTo(HashSet()) { it.pathWithName }
    }

    // An imported module adds what it exports
    private fun withExports(imported: Node): List<Node> = listOf(imported) + classesNamed(imported.angularDeclaration().exports, imported)

    private fun classesNamed(names: List<String>, holder: Node): List<Node> = names.mapNotNull { classNamed(it, holder) }

    private fun classNamed(name: String, holder: Node): Node? {
        val sameNamed = classesByName[name] ?: return null
        if (sameNamed.size == 1) return sameNamed.single()
        val importedPaths = holder.dependencies.mapTo(HashSet()) { it.path }
        return sameNamed.singleOrNull { it.pathWithName in importedPaths }
            ?: sameNamed.singleOrNull { it.physicalPath == holder.physicalPath }
    }

    private fun Node.angularDeclaration(): AngularDeclaration = angular?.declaration ?: NO_DECLARATION

    companion object {
        private val NO_DECLARATION = AngularDeclaration()

        fun qualify(nodes: List<Node>): List<Node> {
            if (nodes.none { it.angular != null }) return nodes
            val references = AngularTemplateReferences(nodes)
            return nodes.map { node -> if (node.language == SupportedLanguage.ANGULAR) references.qualify(node) else node }
        }
    }
}
