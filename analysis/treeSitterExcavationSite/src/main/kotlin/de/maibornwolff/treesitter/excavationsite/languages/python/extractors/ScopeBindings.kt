package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names the statements of one scope bind, in source order: its classes and functions, the [Targets] of its
 * statements, its imports and its `type` aliases. A nested function, lambda, class or comprehension binds in a scope of
 * its own, all but the name of the function or class. Each binding knows the branches of `if` and `try` statements it
 * lies in.
 */
internal class ScopeBindings(
    private val definitionBinding: (definition: SyntaxNode, name: String) -> Binding,
    private val targetBinding: (name: String) -> Binding
) {
    fun of(block: SyntaxNode): List<NamedBinding> = bindingsIn(block, emptyList()).toList()

    private fun bindingsIn(node: SyntaxNode, branches: List<Branch>): Sequence<NamedBinding> = node.children().flatMap { child ->
        val childBranches = if (node.type in BRANCHING_STATEMENTS) branches + Branch(node.startByte, branchOf(node, child)) else branches
        bindingsOf(child, childBranches)
    }

    private fun bindingsOf(statement: SyntaxNode, branches: List<Branch>): Sequence<NamedBinding> = when (statement.type) {
        FUNCTION_DEFINITION, CLASS_DEFINITION -> definitionOf(statement, statement)
        DECORATED_DEFINITION -> statement.getChildByFieldName(DEFINITION_FIELD).orNull()?.let { definitionOf(it, statement) }.orEmpty()
        IMPORT_STATEMENT, IMPORT_FROM_STATEMENT -> ImportBindings.of(statement).asSequence()
        TYPE_ALIAS_STATEMENT -> aliasOf(statement)
        LAMBDA, in COMPREHENSIONS -> emptySequence()
        else -> Targets.boundBy(statement).map { NamedBinding(it, targetBinding(it), statement.endByte) }
    }.map { it.copy(branches = branches) } + if (statement.type in OWN_SCOPES) emptySequence() else bindingsIn(statement, branches)

    // The body of a try and its else clause run together; the except clauses are the alternatives to them
    private fun branchOf(statement: SyntaxNode, part: SyntaxNode): Int = when {
        statement.type == IF_STATEMENT && part.type in IF_BRANCHES -> part.startByte
        statement.type == TRY_STATEMENT && part.type in EXCEPT_CLAUSES -> part.startByte
        statement.type == TRY_STATEMENT && part.type in TRY_BODY_PARTS -> TRY_BODY
        else -> Branch.ALWAYS_RUNS
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
        private const val IF_STATEMENT = "if_statement"
        private const val TRY_STATEMENT = "try_statement"
        private const val TRY_BODY = 0
        private val BRANCHING_STATEMENTS = setOf(IF_STATEMENT, TRY_STATEMENT)
        private val IF_BRANCHES = setOf("block", "elif_clause", "else_clause")
        private val EXCEPT_CLAUSES = setOf("except_clause", "except_group_clause")
        private val TRY_BODY_PARTS = setOf("block", "else_clause")
        private const val LAMBDA = "lambda"
        private const val DEFINITION_FIELD = "definition"
        private const val NAME_FIELD = "name"
        val COMPREHENSIONS = setOf("list_comprehension", "set_comprehension", "dictionary_comprehension", "generator_expression")
        private val OWN_SCOPES = setOf(FUNCTION_DEFINITION, CLASS_DEFINITION, DECORATED_DEFINITION, LAMBDA) + COMPREHENSIONS
    }
}
