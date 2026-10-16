package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The names an Angular template refers to a class by, read from its decorators: the elements its `@Component`
 * selector names and the name of its `@Pipe`. An attribute or class selector names no element, so it is left out.
 */
internal object AngularTemplateNameExtractor {
    private const val ARGUMENTS = "arguments"
    private const val OBJECT = "object"
    private const val PAIR = "pair"
    private const val COMPONENT = "Component"
    private const val SELECTOR = "selector"
    private const val PIPE = "Pipe"
    private const val PIPE_NAME = "name"
    private const val SELECTOR_SEPARATOR = ","
    private val ELEMENT_SELECTOR = Regex("^[a-zA-Z][\\w-]*")

    fun extract(decorators: Sequence<SyntaxNode>): Set<String> = decorators.flatMap { templateNamesOf(it) }.toSet()

    private fun templateNamesOf(decorator: SyntaxNode): List<String> {
        val call = decorator.children().firstOrNull { it.type == CALL_EXPRESSION } ?: return emptyList()
        return when (TreeTraversal.findFirstChildTextByType(call, IDENTIFIER)) {
            COMPONENT -> stringPropertyOf(call, SELECTOR)?.let { elementsOf(it) }.orEmpty()
            PIPE -> listOfNotNull(stringPropertyOf(call, PIPE_NAME))
            else -> emptyList()
        }
    }

    private fun stringPropertyOf(call: SyntaxNode, key: String): String? = call
        .children()
        .filter { it.type == ARGUMENTS }
        .flatMap { it.children() }
        .filter { it.type == OBJECT }
        .flatMap { it.children() }
        .filter { it.type == PAIR && TreeTraversal.findFirstChildTextByType(it, PROPERTY_IDENTIFIER) == key }
        .firstNotNullOfOrNull { pair -> pair.children().firstOrNull { it.type == STRING } }
        ?.let { TreeTraversal.findFirstChildTextByType(it, STRING_FRAGMENT) }

    private fun elementsOf(selector: String): List<String> = selector
        .split(SELECTOR_SEPARATOR)
        .mapNotNull { ELEMENT_SELECTOR.find(it.trim())?.value?.lowercase() }
}
