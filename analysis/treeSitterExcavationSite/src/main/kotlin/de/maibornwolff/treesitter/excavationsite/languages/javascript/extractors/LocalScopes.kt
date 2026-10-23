package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The scopes inside one declaration, by rule 1 of "A simple name" in `docs/name-resolution/typescript.md`: a name that
 * a function, block, loop, `catch` or type parameter list around it binds means that local binding, not the module's
 * declaration or import of the same name. Values and types are apart, as in TypeScript: a parameter `Model` hides the
 * value `Model`, not the type; a class or enum is both.
 *
 * Only the scopes from the name up to the declaration count, given by its byte range, so the declaration's own name and
 * the module around it stay visible.
 */
internal class LocalScopes(private val declarationStart: Int, private val declarationEnd: Int) {
    private val bindingsByScope = HashMap<ScopeKey, Bindings>()

    /** Whether a local binding hides [name]: a type binding for a `type_identifier`, a value binding for any other name. */
    fun hides(name: SyntaxNode): Boolean {
        val text = name.text.trim()
        val isType = name.type == TYPE_IDENTIFIER
        var scope = name.parent
        while (!scope.isNull && scope.startByte >= declarationStart && scope.endByte <= declarationEnd) {
            val bindings = bindingsOf(scope)
            if (text in (if (isType) bindings.types else bindings.values)) return true
            scope = scope.parent
        }
        return false
    }

    private fun bindingsOf(scope: SyntaxNode): Bindings =
        bindingsByScope.getOrPut(ScopeKey(scope.startByte, scope.endByte, scope.type)) { Bindings.of(scope) }

    private data class ScopeKey(val start: Int, val end: Int, val type: String)

    private class Bindings(val values: Set<String>, val types: Set<String>) {
        companion object {
            private const val PARAMETERS_FIELD = "parameters"
            private const val PARAMETER_FIELD = "parameter"
            private const val TYPE_PARAMETERS_FIELD = "type_parameters"
            private const val NAME_FIELD = "name"
            private const val LEFT_FIELD = "left"
            private const val BODY_FIELD = "body"
            private const val ARROW_FUNCTION = "arrow_function"
            private const val MEMBER_EXPRESSION = "member_expression"
            private const val IMPORT_KEYWORD = "import"
            private const val THEN = "then"
            private const val FUNCTION_FIELD = "function"
            private const val OBJECT_FIELD = "object"
            private const val PROPERTY_FIELD = "property"
            private const val STATEMENT_BLOCK = "statement_block"
            private const val FOR_STATEMENT = "for_statement"
            private const val FOR_IN_STATEMENT = "for_in_statement"
            private const val CATCH_CLAUSE = "catch_clause"
            private const val TYPE_PARAMETER = "type_parameter"
            private val VALUE_AND_TYPE_DECLARATIONS = setOf(CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION, ENUM_DECLARATION)
            private val TYPE_DECLARATIONS = setOf(INTERFACE_DECLARATION, TYPE_ALIAS_DECLARATION)
            private val FUNCTION_DECLARATIONS = setOf(FUNCTION_DECLARATION, GENERATOR_FUNCTION_DECLARATION)

            fun of(scope: SyntaxNode): Bindings {
                val values = parameterNames(scope) + declaredValues(scope) + loopAndCatchNames(scope)
                val types = typeParameterNames(scope) + declaredTypes(scope)
                return Bindings(values.toSet(), types.toSet())
            }

            private fun parameterNames(scope: SyntaxNode): List<String> {
                if (isDynamicImportCallback(scope)) return emptyList()
                val parameters = scope.getChildByFieldName(PARAMETERS_FIELD).orNull()
                if (parameters != null) return parameters.namedChildren().flatMap { BindingPatterns.boundNames(it) }.toList()
                if (scope.type != ARROW_FUNCTION) return emptyList()
                val single = scope.getChildByFieldName(PARAMETER_FIELD).orNull()
                    ?: scope.namedChildren().firstOrNull { it.type == IDENTIFIER && !isBodyOf(scope, it) }
                return single?.let { BindingPatterns.boundNames(it) }.orEmpty()
            }

            // The parameters of `import('./m').then(m => …)` bind what module m exports, no local values
            private fun isDynamicImportCallback(scope: SyntaxNode): Boolean {
                val arguments = scope.parent.orNull()?.takeIf { it.type == ARGUMENTS } ?: return false
                val call = arguments.parent.orNull()?.takeIf { it.type == CALL_EXPRESSION } ?: return false
                val callee = call.getChildByFieldName(FUNCTION_FIELD).orNull()?.takeIf { it.type == MEMBER_EXPRESSION } ?: return false
                val receiver = callee.getChildByFieldName(OBJECT_FIELD).orNull()?.takeIf { it.type == CALL_EXPRESSION } ?: return false
                val isThen = callee.getChildByFieldName(PROPERTY_FIELD).orNull()?.text == THEN
                return isThen && receiver.getChildByFieldName(FUNCTION_FIELD).orNull()?.type == IMPORT_KEYWORD
            }

            private fun isBodyOf(scope: SyntaxNode, child: SyntaxNode): Boolean {
                val body = scope.getChildByFieldName(BODY_FIELD).orNull() ?: return false
                return body.startByte == child.startByte && body.endByte == child.endByte
            }

            private fun typeParameterNames(scope: SyntaxNode): List<String> = scope
                .getChildByFieldName(TYPE_PARAMETERS_FIELD)
                .orNull()
                ?.namedChildren()
                ?.filter { it.type == TYPE_PARAMETER }
                ?.mapNotNull { it.getChildByFieldName(NAME_FIELD).orNull()?.text?.trim() }
                ?.toList()
                .orEmpty()

            private fun declaredValues(scope: SyntaxNode): List<String> {
                if (scope.type != STATEMENT_BLOCK) return emptyList()
                return scope
                    .namedChildren()
                    .flatMap { statement ->
                        when (statement.type) {
                            LEXICAL_DECLARATION, VARIABLE_DECLARATION -> declaratorNames(statement)
                            in FUNCTION_DECLARATIONS, in VALUE_AND_TYPE_DECLARATIONS -> listOfNotNull(nameOf(statement))
                            else -> emptyList()
                        }
                    }.toList()
            }

            private fun declaredTypes(scope: SyntaxNode): List<String> {
                if (scope.type != STATEMENT_BLOCK) return emptyList()
                return scope
                    .namedChildren()
                    .filter { it.type in VALUE_AND_TYPE_DECLARATIONS || it.type in TYPE_DECLARATIONS }
                    .mapNotNull { nameOf(it) }
                    .toList()
            }

            private fun loopAndCatchNames(scope: SyntaxNode): List<String> = when (scope.type) {
                FOR_IN_STATEMENT -> scope.getChildByFieldName(LEFT_FIELD).orNull()?.let { BindingPatterns.boundNames(it) }.orEmpty()
                FOR_STATEMENT ->
                    scope
                        .namedChildren()
                        .filter { it.type == LEXICAL_DECLARATION || it.type == VARIABLE_DECLARATION }
                        .flatMap { declaratorNames(it) }
                        .toList()
                CATCH_CLAUSE -> scope.getChildByFieldName(PARAMETER_FIELD).orNull()?.let { BindingPatterns.boundNames(it) }.orEmpty()
                else -> emptyList()
            }

            private fun declaratorNames(declaration: SyntaxNode): List<String> = declaration
                .namedChildren()
                .filter { it.type == VARIABLE_DECLARATOR && !BindingPatterns.bindsModule(it) }
                .flatMap { declarator ->
                    declarator.getChildByFieldName(NAME_FIELD).orNull()?.let { BindingPatterns.boundNames(it) }.orEmpty()
                }.toList()

            private fun nameOf(declaration: SyntaxNode): String? = declaration.getChildByFieldName(NAME_FIELD).orNull()?.text?.trim()
        }
    }
}
