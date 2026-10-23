package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Whether a name written in a Python definition means what a function or comprehension around it binds, which no
 * other file can name. A function binds its parameters and every name its body assigns, loops over, catches, opens
 * with `with`, names with `:=` or declares with `def` or `class`, wherever in the body, unless a `global` or
 * `nonlocal` statement hands the name on; a comprehension binds the names it loops over. A name an import inside the
 * function binds is no such name: it means what the import names.
 */
internal class FunctionScopes {
    private val namesByScope = HashMap<Pair<Int, String>, Set<String>>()

    fun isLocal(identifier: SyntaxNode): Boolean = identifier
        .ancestors()
        .any { scope -> encloses(scope, identifier) && identifier.text in namesBoundBy(scope) }

    private fun encloses(scope: SyntaxNode, identifier: SyntaxNode): Boolean = when (scope.type) {
        FUNCTION_DEFINITION, LAMBDA -> scope.getChildByFieldName(BODY_FIELD).orNull()?.contains(identifier) == true
        in COMPREHENSIONS -> true
        else -> false
    }

    private fun namesBoundBy(scope: SyntaxNode): Set<String> = namesByScope.getOrPut(scope.startByte to scope.type) {
        if (scope.type in COMPREHENSIONS) {
            scope.children().filter { it.type == FOR_IN_CLAUSE }.flatMap { targetNames(it.getChildByFieldName(LEFT_FIELD)) }.toSet()
        } else {
            val body = scope.getChildByFieldName(BODY_FIELD).orNull()
            val handedOn = body?.let { namesHandedOn(it).toSet() }.orEmpty()
            parameterNames(scope) + body?.let { boundIn(it).toSet() }.orEmpty() - handedOn
        }
    }

    private fun parameterNames(function: SyntaxNode): Set<String> {
        val parameters = function.getChildByFieldName(PARAMETERS_FIELD).orNull() ?: return emptySet()
        return parameters.children().flatMap { parameter -> parameterName(parameter) }.toSet()
    }

    private fun parameterName(parameter: SyntaxNode): Sequence<String> = when (parameter.type) {
        IDENTIFIER -> sequenceOf(parameter.text)
        DEFAULT_PARAMETER, TYPED_DEFAULT_PARAMETER -> nameOf(parameter)
        TYPED_PARAMETER, in SPLAT_PATTERNS -> parameter.children().flatMap { parameterName(it) }
        else -> emptySequence()
    }

    // A nested function, lambda or class binds in a scope of its own, all but its own name
    private fun boundIn(node: SyntaxNode): Sequence<String> = node.children().flatMap { child ->
        when (child.type) {
            FUNCTION_DEFINITION, CLASS_DEFINITION -> nameOf(child)
            LAMBDA, in COMPREHENSIONS -> emptySequence()
            else -> bindingsOf(child) + boundIn(child)
        }
    }

    private fun bindingsOf(node: SyntaxNode): Sequence<String> = when (node.type) {
        ASSIGNMENT, AUGMENTED_ASSIGNMENT, FOR_STATEMENT -> targetNames(node.getChildByFieldName(LEFT_FIELD))
        AS_PATTERN_TARGET -> node.children().flatMap { targetNames(it) }
        NAMED_EXPRESSION -> nameOf(node)
        else -> emptySequence()
    }

    // An attribute or subscript as target binds no name
    private fun targetNames(target: SyntaxNode): Sequence<String> = when {
        target.isNull -> emptySequence()
        target.type == IDENTIFIER -> sequenceOf(target.text)
        target.type in TARGET_GROUPS -> target.children().flatMap { targetNames(it) }
        else -> emptySequence()
    }

    private fun namesHandedOn(node: SyntaxNode): Sequence<String> = node.children().flatMap { child ->
        when (child.type) {
            in HANDING_ON_STATEMENTS -> child.children().filter { it.type == IDENTIFIER }.map { it.text }
            FUNCTION_DEFINITION, CLASS_DEFINITION, LAMBDA -> emptySequence()
            else -> namesHandedOn(child)
        }
    }

    private fun nameOf(node: SyntaxNode): Sequence<String> = listOfNotNull(node.getChildByFieldName(NAME_FIELD).orNull()?.text).asSequence()

    private fun SyntaxNode.contains(other: SyntaxNode): Boolean = other.startByte >= startByte && other.endByte <= endByte

    companion object {
        private const val IDENTIFIER = "identifier"
        private const val FUNCTION_DEFINITION = "function_definition"
        private const val CLASS_DEFINITION = "class_definition"
        private const val LAMBDA = "lambda"
        private const val FOR_IN_CLAUSE = "for_in_clause"
        private const val DEFAULT_PARAMETER = "default_parameter"
        private const val TYPED_DEFAULT_PARAMETER = "typed_default_parameter"
        private const val TYPED_PARAMETER = "typed_parameter"
        private const val ASSIGNMENT = "assignment"
        private const val AUGMENTED_ASSIGNMENT = "augmented_assignment"
        private const val FOR_STATEMENT = "for_statement"
        private const val AS_PATTERN_TARGET = "as_pattern_target"
        private const val NAMED_EXPRESSION = "named_expression"
        private const val BODY_FIELD = "body"
        private const val NAME_FIELD = "name"
        private const val LEFT_FIELD = "left"
        private const val PARAMETERS_FIELD = "parameters"
        private val COMPREHENSIONS = setOf("list_comprehension", "set_comprehension", "dictionary_comprehension", "generator_expression")
        private val SPLAT_PATTERNS = setOf("list_splat_pattern", "dictionary_splat_pattern")
        private val TARGET_GROUPS = setOf("pattern_list", "tuple_pattern", "list_pattern", "list_splat_pattern", "parenthesized_expression")
        private val HANDING_ON_STATEMENTS = setOf("global_statement", "nonlocal_statement")
    }
}
