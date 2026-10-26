package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.api.AngularSelector

/**
 * A template uses a pipe by its pipe name and the components and directives whose selector matches one of its elements,
 * which only the classes declaring them know. Each pipe name of a template is rewritten to the full path of the class
 * it means, and each class a matching selector means is added by its full path, so they resolve like any type written
 * with its full path. Every selector that matches an element counts, as an element carries one component and any
 * number of directives. A name or selector one class declares means that class. One several classes declare means the
 * one in the scope of the template's component, as Angular decides it: what the standalone component imports, or what
 * the module declaring the component declares and imports. An imported module adds what it exports, and a module it
 * exports adds what that one exports in turn. A name no class declares, such as an HTML element or a library
 * component, and a name the scope does not decide are dropped, so they cannot resolve to code that merely shares it.
 *
 * A decorator names classes by their simple name; several classes of that name mean the one the file of the decorator
 * imports, or else the one in that file.
 */
internal class AngularTemplateReferences private constructor(nodes: List<Node>) {
    private val angularNodes = nodes.filter { it.angular != null && it.language != SupportedLanguage.ANGULAR }

    // A class with a selector is matched by it, see [matches]; the template names of the others are pipe names
    private val selectorClasses = angularNodes.filter { it.angularDeclaration().selectors.isNotEmpty() }
    private val declarationsByTemplateName: Map<String, List<Node>> = (angularNodes - selectorClasses.toSet())
        .flatMap { node -> node.angularDeclaration().templateNames.map { templateName -> templateName to node } }
        .groupBy({ it.first }, { it.second })
    private val componentsByTemplate: Map<Path, Node> = angularNodes
        .mapNotNull { node -> node.angular?.templatePath?.let { templatePath -> templatePath to node } }
        .toMap()
    private val classesByName: Map<String, List<Node>> = angularNodes.groupBy { it.name() }
    private val modules: List<Node> = angularNodes.filter { it.angularDeclaration().declarations.isNotEmpty() }

    private fun qualify(template: Node): Node {
        val pipes = template.usedTypes.mapNotNull { type ->
            declarationOf(declarationsByTemplateName[type.name].orEmpty(), template)?.let { type.copy(name = it.pathWithName.withDots()) }
        }
        val matchedClasses = template.angularDeclaration().elements.flatMap { matchedClassesOf(it, template) }
        return template.copy(
            usedTypes = (pipes + matchedClasses.map { Type.simple(it.pathWithName.withDots()) }).toCollection(LinkedHashSet())
        )
    }

    // The classes of each matching selector alternative, which several classes may declare
    private fun matchedClassesOf(element: AngularSelector, template: Node): List<Node> = selectorClasses
        .mapNotNull { node -> node.angularDeclaration().selectors.firstOrNull { it.matches(element) }?.let { it to node } }
        .groupBy({ it.first }, { it.second })
        .values
        .mapNotNull { candidates -> declarationOf(candidates, template) }

    private fun declarationOf(candidates: List<Node>, template: Node): Node? {
        if (candidates.size <= 1) return candidates.singleOrNull()
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
            classesNamed(declaration.declarations, module) + classesNamed(declaration.imports, module)
        }
        return (ownImports + moduleScope).flatMap { withExports(it, mutableSetOf()) }.mapTo(HashSet()) { it.pathWithName }
    }

    // A module stands for what it exports, a re-exported module for what that one exports; a cycle ends at a module seen
    private fun withExports(imported: Node, visited: MutableSet<Path>): List<Node> {
        if (!visited.add(imported.pathWithName)) return emptyList()
        val exports = imported.angularDeclaration().exports
        return listOf(imported) + classesNamed(exports, imported).flatMap { withExports(it, visited) }
    }

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
            if (nodes.none { it.language == SupportedLanguage.ANGULAR }) return nodes
            val references = AngularTemplateReferences(nodes)
            return nodes.map { node -> if (node.language == SupportedLanguage.ANGULAR) references.qualify(node) else node }
        }
    }
}
