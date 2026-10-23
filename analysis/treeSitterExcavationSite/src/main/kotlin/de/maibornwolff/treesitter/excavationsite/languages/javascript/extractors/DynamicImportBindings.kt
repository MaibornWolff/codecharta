package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a dynamic import's result binds, by decision 4 of `docs/name-resolution/typescript.md`: the parameter of
 * `import('./m').then(m => …)` and the name of `const m = await import('./m')` bind the module, a destructuring of
 * either binds what the module exports, each in its own scope. A module is written as the binding
 * [DynamicImports.bindingNameOf] gives its import, an export as that binding plus the exported name.
 */
internal class DynamicImportBindings private constructor(private val bindings: List<Binding>) {
    /** The module the name [identifier] is bound to by a dynamic import around it, null for any other name. */
    fun moduleOf(identifier: SyntaxNode): String? = bindingOf(identifier)?.takeIf { it.exportedName == null }?.module

    /** The export of a dynamically imported module the name [identifier] is bound to, null for any other name. */
    fun exportOf(identifier: SyntaxNode): String? {
        val binding = bindingOf(identifier) ?: return null
        return binding.exportedName?.let { binding.module + SEPARATOR + it }
    }

    private fun bindingOf(identifier: SyntaxNode): Binding? = bindings
        .filter { it.name == identifier.text && identifier.startByte >= it.scopeStart && identifier.endByte <= it.scopeEnd }
        .minByOrNull { it.scopeEnd - it.scopeStart }

    private data class Binding(
        val name: String,
        val scopeStart: Int,
        val scopeEnd: Int,
        val module: String,
        val exportedName: String?
    )

    companion object {
        private const val SEPARATOR = "."
        private const val IMPORT_KEYWORD = "import"
        private const val AWAIT_EXPRESSION = "await_expression"
        private const val MEMBER_EXPRESSION = "member_expression"
        private const val ARROW_FUNCTION = "arrow_function"
        private const val FUNCTION_EXPRESSION = "function_expression"
        private const val STATEMENT_BLOCK = "statement_block"
        private const val PROGRAM = "program"
        private const val REQUIRED_PARAMETER = "required_parameter"
        private const val OPTIONAL_PARAMETER = "optional_parameter"
        private const val THEN = "then"
        private const val PROPERTY_FIELD = "property"
        private const val PARAMETER_FIELD = "parameter"
        private const val PARAMETERS_FIELD = "parameters"
        private const val PATTERN_FIELD = "pattern"
        private const val NAME_FIELD = "name"
        private const val KEY_FIELD = "key"
        private val CALLBACKS = setOf(ARROW_FUNCTION, FUNCTION_EXPRESSION)
        private val SCOPES = setOf(STATEMENT_BLOCK, PROGRAM)

        fun of(rootNode: SyntaxNode): DynamicImportBindings = DynamicImportBindings(
            TreeTraversal
                .findAllDescendantsOfType(rootNode, CALL_EXPRESSION)
                .filter { call -> call.children().any { it.type == IMPORT_KEYWORD } }
                .flatMap { bindingsOf(it) }
                .toList()
        )

        private fun bindingsOf(importCall: SyntaxNode): List<Binding> {
            val module = DynamicImports.bindingNameOf(importCall)
            val callback = callbackOf(importCall)
            if (callback != null) return firstParameterOf(callback)?.let { bindingsIn(it, callback, module) }.orEmpty()
            val declarator = importCall.parent.takeIf { it.type == AWAIT_EXPRESSION }?.parent?.takeIf { it.type == VARIABLE_DECLARATOR }
                ?: return emptyList()
            val pattern = declarator.getChildByFieldName(NAME_FIELD).orNull() ?: return emptyList()
            val scope = generateSequence(declarator.parent) { it.parent.orNull() }.firstOrNull { it.type in SCOPES } ?: return emptyList()
            return bindingsIn(pattern, scope, module)
        }

        // The function of `import('./m').then(callback)`
        private fun callbackOf(importCall: SyntaxNode): SyntaxNode? {
            val then = importCall.parent.takeIf { it.type == MEMBER_EXPRESSION && it.getChildByFieldName(PROPERTY_FIELD).text == THEN }
            val call = then?.parent?.takeIf { it.type == CALL_EXPRESSION } ?: return null
            return call.children().firstOrNull { it.type == ARGUMENTS }?.namedChildren()?.firstOrNull { it.type in CALLBACKS }
        }

        private fun firstParameterOf(callback: SyntaxNode): SyntaxNode? {
            val parameter = callback.getChildByFieldName(PARAMETER_FIELD).orNull()
                ?: callback.getChildByFieldName(PARAMETERS_FIELD).orNull()?.namedChildren()?.firstOrNull()
                ?: return null
            val isTyped = parameter.type == REQUIRED_PARAMETER || parameter.type == OPTIONAL_PARAMETER
            return if (isTyped) parameter.getChildByFieldName(PATTERN_FIELD).orNull() else parameter
        }

        private fun bindingsIn(pattern: SyntaxNode, scope: SyntaxNode, module: String): List<Binding> = when (pattern.type) {
            IDENTIFIER -> listOf(Binding(pattern.text, scope.startByte, scope.endByte, module, exportedName = null))
            OBJECT_PATTERN -> pattern.namedChildren().mapNotNull { exportBindingOf(it, scope, module) }.toList()
            else -> emptyList()
        }

        // `{ A }` binds `A` to the export `A`, `{ A: B }` binds `B` to it
        private fun exportBindingOf(property: SyntaxNode, scope: SyntaxNode, module: String): Binding? = when (property.type) {
            SHORTHAND_PROPERTY_IDENTIFIER_PATTERN -> Binding(property.text, scope.startByte, scope.endByte, module, property.text)
            PAIR_PATTERN -> {
                val exported = property.getChildByFieldName(KEY_FIELD).orNull()?.text
                val local = property.getChildByFieldName(VALUE_FIELD).orNull()?.takeIf { it.type == IDENTIFIER }?.text
                if (exported == null || local == null) null else Binding(local, scope.startByte, scope.endByte, module, exported)
            }
            else -> null
        }
    }
}
