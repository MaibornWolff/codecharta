package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names the statements of one scope bind, in source order: its classes and functions, the [Targets] of its
 * statements, its imports and its `type` aliases. A nested function, lambda, class or comprehension binds in a scope of
 * its own, all but the name of the function or class.
 */
internal class ScopeBindings(
    private val definitionBinding: (definition: SyntaxNode, name: String) -> Binding,
    private val targetBinding: (name: String) -> Binding
) {
    fun of(block: SyntaxNode): List<NamedBinding> = bindingsIn(block).toList()

    private fun bindingsIn(node: SyntaxNode): Sequence<NamedBinding> = node.children().flatMap { child ->
        when (child.type) {
            FUNCTION_DEFINITION, CLASS_DEFINITION -> definitionOf(child, child)
            DECORATED_DEFINITION -> child.getChildByFieldName(DEFINITION_FIELD).orNull()?.let { definitionOf(it, child) }.orEmpty()
            IMPORT_STATEMENT, IMPORT_FROM_STATEMENT -> ImportBindings.of(child).asSequence()
            TYPE_ALIAS_STATEMENT -> aliasOf(child)
            LAMBDA, in COMPREHENSIONS -> emptySequence()
            else -> Targets.boundBy(child).map { NamedBinding(it, targetBinding(it), child.endByte) } + bindingsIn(child)
        }
    }

    private fun definitionOf(definition: SyntaxNode, outermostNode: SyntaxNode): Sequence<NamedBinding> {
        val name = definition.getChildByFieldName(NAME_FIELD).orNull()?.text ?: return emptySequence()
        return sequenceOf(NamedBinding(name, definitionBinding(definition, name), outermostNode.endByte))
    }

    private fun aliasOf(statement: SyntaxNode): Sequence<NamedBinding> {
        val name = statement
            .namedChildren()
            .firstOrNull()
            ?.namedChildren()
            ?.firstOrNull { it.type == IDENTIFIER }
            ?.text
        return listOfNotNull(name).asSequence().map { NamedBinding(it, targetBinding(it), statement.endByte) }
    }

    companion object {
        private const val IDENTIFIER = "identifier"
        private const val FUNCTION_DEFINITION = "function_definition"
        private const val CLASS_DEFINITION = "class_definition"
        private const val DECORATED_DEFINITION = "decorated_definition"
        private const val IMPORT_STATEMENT = "import_statement"
        private const val IMPORT_FROM_STATEMENT = "import_from_statement"
        private const val TYPE_ALIAS_STATEMENT = "type_alias_statement"
        private const val LAMBDA = "lambda"
        private const val DEFINITION_FIELD = "definition"
        private const val NAME_FIELD = "name"
        val COMPREHENSIONS = setOf("list_comprehension", "set_comprehension", "dictionary_comprehension", "generator_expression")
    }
}
