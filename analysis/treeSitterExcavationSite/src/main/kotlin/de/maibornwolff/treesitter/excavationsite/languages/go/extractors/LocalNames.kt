package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Whether a name written in a Go declaration means something the code around it declares, which no other file can
 * name: a type parameter of an enclosing function or type, a parameter, result or receiver of an enclosing function
 * once inside its body, or a variable, constant or type declared before the name in an enclosing block or statement
 * header. The package block, where the declarations other files see live, is not looked at.
 */
internal object LocalNames {
    private const val SOURCE_FILE = "source_file"
    private const val IDENTIFIER = "identifier"
    private const val SHORT_VARIABLE_DECLARATION = "short_var_declaration"
    private const val VARIABLE_DECLARATION = "var_declaration"
    private const val CONSTANT_DECLARATION = "const_declaration"
    private const val TYPE_DECLARATION = "type_declaration"
    private const val FOR_CLAUSE = "for_clause"
    private const val RANGE_CLAUSE = "range_clause"
    private const val RECEIVE_STATEMENT = "receive_statement"
    private const val EXPRESSION_LIST = "expression_list"
    private const val SHORT_VARIABLE_DECLARATION_OPERATOR = ":="
    private const val TYPE_PARAMETERS_FIELD = "type_parameters"
    private const val BODY_FIELD = "body"
    private const val LEFT_FIELD = "left"
    private const val NAME_FIELD = "name"
    private const val INITIALIZER_FIELD = "initializer"
    private const val ALIAS_FIELD = "alias"

    private val FUNCTIONS = setOf("function_declaration", "method_declaration", "func_literal")
    private val PARAMETER_FIELDS = listOf("receiver", "parameters", "result")
    private val PARAMETERS = setOf("parameter_declaration", "variadic_parameter_declaration", "type_parameter_declaration")
    private val VARIABLE_SPECS = setOf("var_spec", "const_spec")
    private val TYPE_SPECS = setOf("type_spec", "type_alias")

    fun isLocal(occurrence: SyntaxNode, name: String): Boolean = occurrence
        .ancestors()
        .takeWhile { it.type != SOURCE_FILE }
        .any { scope -> declaresAround(scope, occurrence, name) || declaresBefore(scope, occurrence, name) }

    private fun declaresAround(scope: SyntaxNode, occurrence: SyntaxNode, name: String): Boolean {
        val typeParameters = scope.getChildByFieldName(TYPE_PARAMETERS_FIELD).orNull()
        if (typeParameters != null && name in parameterNames(typeParameters)) return true
        if (scope.type !in FUNCTIONS || !isInBody(scope, occurrence)) return false
        return PARAMETER_FIELDS
            .mapNotNull { scope.getChildByFieldName(it).orNull() }
            .any { name in parameterNames(it) }
    }

    private fun isInBody(function: SyntaxNode, occurrence: SyntaxNode): Boolean {
        val body = function.getChildByFieldName(BODY_FIELD).orNull() ?: return false
        return occurrence.startByte >= body.startByte && occurrence.endByte <= body.endByte
    }

    private fun parameterNames(parameterList: SyntaxNode): List<String> = parameterList
        .children()
        .filter { it.type in PARAMETERS }
        .flatMap { parameter -> identifiersOf(parameter) }
        .toList()

    private fun declaresBefore(scope: SyntaxNode, occurrence: SyntaxNode, name: String): Boolean = scope
        .children()
        .filter { it.endByte <= occurrence.startByte }
        .any { statement -> name in namesDeclaredBy(scope, statement) }

    private fun namesDeclaredBy(scope: SyntaxNode, statement: SyntaxNode): List<String> = when (statement.type) {
        SHORT_VARIABLE_DECLARATION -> leftIdentifiersOf(statement)
        VARIABLE_DECLARATION, CONSTANT_DECLARATION -> specsBelow(statement, VARIABLE_SPECS).flatMap { identifiersOf(it) }
        TYPE_DECLARATION -> specsBelow(statement, TYPE_SPECS).mapNotNull { it.getChildByFieldName(NAME_FIELD).orNull()?.text }
        FOR_CLAUSE -> statement.getChildByFieldName(INITIALIZER_FIELD).orNull()?.let { namesDeclaredBy(statement, it) }.orEmpty()
        RANGE_CLAUSE, RECEIVE_STATEMENT -> if (declaresVariables(statement)) leftIdentifiersOf(statement) else emptyList()
        EXPRESSION_LIST -> if (isAliasOf(scope, statement)) identifiersOf(statement) else emptyList()
        else -> emptyList()
    }

    private fun declaresVariables(statement: SyntaxNode): Boolean =
        statement.children().any { it.type == SHORT_VARIABLE_DECLARATION_OPERATOR }

    // The variable of a type switch, `switch value := x.(type)`
    private fun isAliasOf(scope: SyntaxNode, expressionList: SyntaxNode): Boolean =
        scope.getChildByFieldName(ALIAS_FIELD).orNull()?.startByte == expressionList.startByte

    private fun specsBelow(declaration: SyntaxNode, specTypes: Set<String>): List<SyntaxNode> = declaration
        .children()
        .flatMap { child -> if (child.type in specTypes) sequenceOf(child) else child.children().filter { it.type in specTypes } }
        .toList()

    private fun leftIdentifiersOf(statement: SyntaxNode): List<String> =
        statement.getChildByFieldName(LEFT_FIELD).orNull()?.let { identifiersOf(it) }.orEmpty()

    private fun identifiersOf(node: SyntaxNode): List<String> = node.children().filter { it.type == IDENTIFIER }.map { it.text }.toList()
}
