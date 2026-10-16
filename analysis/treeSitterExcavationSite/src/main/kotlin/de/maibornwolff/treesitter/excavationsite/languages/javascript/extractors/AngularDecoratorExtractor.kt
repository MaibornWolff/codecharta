package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * What the Angular decorator of a class declares: the elements its `@Component` selector names and the name of its
 * `@Pipe`, the names a template refers to the class by, the template file of a component, and the classes a component
 * or an `@NgModule` imports, declares and exports. An attribute or class selector names no element, so it is left out.
 * The inline template of a component is a source of its own, see [InlineTemplateExtractor].
 */
internal object AngularDecoratorExtractor {
    private const val COMPONENT = "Component"
    private const val SELECTOR = "selector"
    private const val TEMPLATE_URL = "templateUrl"
    private const val TEMPLATE = "template"
    private const val PIPE = "Pipe"
    private const val NG_MODULE = "NgModule"
    private const val IMPORTS = "imports"
    private const val DECLARATIONS = "declarations"
    private const val EXPORTS = "exports"
    private const val PIPE_NAME = "name"
    private const val SELECTOR_SEPARATOR = ","
    private val ELEMENT_SELECTOR = Regex("^[a-zA-Z][\\w-]*")

    // A class has one Angular decorator
    fun extract(decorators: Sequence<SyntaxNode>): AngularDeclaration? = decorators.firstNotNullOfOrNull { declarationOf(it) }

    fun isInlineTemplate(stringNode: SyntaxNode): Boolean {
        val pair = stringNode.parent.takeIf { it.type == PAIR } ?: return false
        if (TreeTraversal.findFirstChildTextByType(pair, PROPERTY_IDENTIFIER) != TEMPLATE) return false
        val call = TreeTraversal.findAncestorOfType(pair, CALL_EXPRESSION) ?: return false
        return call.parent.type == DECORATOR && TreeTraversal.findFirstChildTextByType(call, IDENTIFIER) == COMPONENT
    }

    // The template the literal stands for, its escapes resolved; a `${}` substitution stays as it is written
    fun inlineTemplateOf(decorator: SyntaxNode): String? = callOf(decorator)
        ?.takeIf { TreeTraversal.findFirstChildTextByType(it, IDENTIFIER) == COMPONENT }
        ?.let { valueOf(it, TEMPLATE) }
        ?.takeIf { it.type == STRING || it.type == TEMPLATE_STRING }
        ?.text
        ?.let { unescapeJavascript(it.substring(1, it.length - 1)) }

    private fun callOf(decorator: SyntaxNode): SyntaxNode? = decorator.children().firstOrNull { it.type == CALL_EXPRESSION }

    private fun declarationOf(decorator: SyntaxNode): AngularDeclaration? {
        val call = callOf(decorator) ?: return null
        return when (TreeTraversal.findFirstChildTextByType(call, IDENTIFIER)) {
            COMPONENT -> componentOf(call)
            PIPE -> AngularDeclaration(templateNames = setOfNotNull(stringPropertyOf(call, PIPE_NAME)))
            NG_MODULE -> moduleOf(call)
            else -> null
        }
    }

    private fun componentOf(call: SyntaxNode): AngularDeclaration = AngularDeclaration(
        templateNames = stringPropertyOf(call, SELECTOR)?.let { elementsOf(it) }.orEmpty().toSet(),
        templateUrl = stringPropertyOf(call, TEMPLATE_URL),
        imports = classesOf(call, IMPORTS)
    )

    private fun moduleOf(call: SyntaxNode): AngularDeclaration = AngularDeclaration(
        imports = classesOf(call, IMPORTS),
        declarations = classesOf(call, DECLARATIONS),
        exports = classesOf(call, EXPORTS)
    )

    // The classes an array names directly; a spread or a call such as forwardRef() names none
    private fun classesOf(call: SyntaxNode, key: String): List<String> = valueOf(call, key)
        ?.takeIf { it.type == ARRAY }
        ?.children()
        ?.filter { it.type == IDENTIFIER }
        ?.map { it.text }
        ?.toList()
        .orEmpty()

    private fun stringPropertyOf(call: SyntaxNode, key: String): String? = valueOf(call, key)
        ?.takeIf { it.type == STRING }
        ?.let { TreeTraversal.findFirstChildTextByType(it, STRING_FRAGMENT) }

    private fun valueOf(call: SyntaxNode, key: String): SyntaxNode? = call
        .children()
        .filter { it.type == ARGUMENTS }
        .flatMap { it.children() }
        .filter { it.type == OBJECT }
        .flatMap { it.children() }
        .filter { it.type == PAIR && TreeTraversal.findFirstChildTextByType(it, PROPERTY_IDENTIFIER) == key }
        .firstNotNullOfOrNull { pair -> pair.getChildByFieldName(VALUE_FIELD).orNull() }

    private fun elementsOf(selector: String): List<String> = selector
        .split(SELECTOR_SEPARATOR)
        .mapNotNull { ELEMENT_SELECTOR.find(it.trim())?.value?.lowercase() }
}
