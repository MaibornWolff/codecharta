package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * What the scopes around a Python name bind it to, by rule 1 of `docs/name-resolution/python.md`: a function or lambda
 * its parameters and every name its body binds, wherever in the body, unless a `global` or `nonlocal` statement hands
 * the name on; a comprehension the names it loops over; a class body what it binds before the name, seen only by a
 * name written directly in it. Null when no scope around binds the name, which leaves it to the module.
 */
internal class LocalScopes {
    private val bindingsByScope = HashMap<Pair<Int, String>, List<NamedBinding>>()

    /** The bindings of the innermost scope around that binds the name: its last one and the alternatives to it. */
    fun bindingsOf(name: SyntaxNode): List<Binding>? {
        val scopes = name.ancestors().filter { encloses(it, name) }.toList()
        return scopes.withIndex().firstNotNullOfOrNull { (index, scope) ->
            val visible = when {
                scope.type != CLASS_DEFINITION -> scopeBindings(scope)
                index == 0 -> scopeBindings(scope).filter { it.position <= name.startByte }
                else -> emptyList()
            }
            visible.lastWithAlternatives(name.text).map { it.binding }.ifEmpty { null }
        }
    }

    /** Whether the name runs only when a function or lambda around it is called. */
    fun isInFunctionBody(name: SyntaxNode): Boolean = name.ancestors().any { it.type in FUNCTIONS && encloses(it, name) }

    private fun encloses(scope: SyntaxNode, name: SyntaxNode): Boolean = when (scope.type) {
        in FUNCTIONS, CLASS_DEFINITION -> scope.getChildByFieldName(BODY_FIELD).orNull()?.contains(name) == true
        in ScopeBindings.COMPREHENSIONS -> true
        else -> false
    }

    private fun scopeBindings(scope: SyntaxNode): List<NamedBinding> = bindingsByScope.getOrPut(scope.startByte to scope.type) {
        when (scope.type) {
            in ScopeBindings.COMPREHENSIONS ->
                scope
                    .children()
                    .flatMap {
                        Targets.boundBy(
                            it
                        )
                    }.map { NamedBinding(it, Binding.Value, 0) }
                    .toList()
            CLASS_DEFINITION -> classBodyBindings(scope)
            else -> functionBindings(scope)
        }
    }

    private fun functionBindings(function: SyntaxNode): List<NamedBinding> {
        val body = function.getChildByFieldName(BODY_FIELD).orNull() ?: return emptyList()
        val handedOn = namesHandedOn(body).toSet()
        val parameters = Parameters.namesOf(function).map { NamedBinding(it, Binding.Value, 0) }
        val bodyBindings = ScopeBindings({ _, _ -> Binding.Value }, { Binding.Value }).of(body)
        return (parameters + bodyBindings).filter { it.name !in handedOn }
    }

    // A class nested in a declared class is a declaration of its own; everything else a class body binds is a value
    private fun classBodyBindings(classDefinition: SyntaxNode): List<NamedBinding> {
        val body = classDefinition.getChildByFieldName(BODY_FIELD).orNull() ?: return emptyList()
        val classPath = ClassPaths.of(classDefinition)
        val nestedClassBinding = { definition: SyntaxNode, name: String ->
            if (definition.type == CLASS_DEFINITION && classPath != null) Binding.OwnDeclaration(classPath + name) else Binding.Value
        }
        return ScopeBindings(nestedClassBinding) { Binding.Value }.of(body)
    }

    private fun namesHandedOn(node: SyntaxNode): Sequence<String> = node.children().flatMap { child ->
        when (child.type) {
            in HANDING_ON_STATEMENTS -> child.children().filter { it.type == IDENTIFIER }.map { it.text }
            in FUNCTIONS, CLASS_DEFINITION -> emptySequence()
            else -> namesHandedOn(child)
        }
    }

    private fun SyntaxNode.contains(other: SyntaxNode): Boolean = other.startByte >= startByte && other.endByte <= endByte

    companion object {
        private const val IDENTIFIER = "identifier"
        private const val CLASS_DEFINITION = "class_definition"
        private const val BODY_FIELD = "body"
        private val FUNCTIONS = setOf("function_definition", "lambda")
        private val HANDING_ON_STATEMENTS = setOf("global_statement", "nonlocal_statement")
    }
}
