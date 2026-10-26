package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names the `use` declarations of one namespace block bind, by kind: a class or namespace name, a function or a
 * constant, each to the full path it imports. A name is bound as written (`php.md`, decision 5).
 */
internal class PhpImports private constructor(
    private val classes: Map<String, List<String>>,
    private val functions: Map<String, List<String>>,
    private val constants: Map<String, List<String>>
) {
    fun classPath(name: String): List<String>? = classes[name]

    fun functionPath(name: String): List<String>? = functions[name]

    fun constantPath(name: String): List<String>? = constants[name]

    private enum class Kind { CLASS, FUNCTION, CONSTANT }

    private class Binding(val kind: Kind, val alias: String, val path: List<String>)

    companion object {
        private const val NAMESPACE_USE_DECLARATION = "namespace_use_declaration"
        private const val NAMESPACE_USE_CLAUSE = "namespace_use_clause"
        private const val NAMESPACE_USE_GROUP = "namespace_use_group"
        private const val NAMESPACE_NAME = "namespace_name"
        private const val NAME = "name"
        private const val QUALIFIED_NAME = "qualified_name"
        private const val TYPE_FIELD = "type"
        private const val ALIAS_FIELD = "alias"
        private const val BODY_FIELD = "body"
        private const val FUNCTION_KEYWORD = "function"
        private const val CONSTANT_KEYWORD = "const"

        fun of(statements: List<SyntaxNode>): PhpImports {
            val bindings = statements.filter { it.type == NAMESPACE_USE_DECLARATION }.flatMap { bindingsOf(it) }
            val byKind = { kind: Kind -> bindings.filter { it.kind == kind } }
            return PhpImports(
                classes = byKind(Kind.CLASS).associate { it.alias to it.path },
                functions = byKind(Kind.FUNCTION).associate { it.alias to it.path },
                constants = byKind(Kind.CONSTANT).associate { it.alias to it.path }
            )
        }

        private fun bindingsOf(declaration: SyntaxNode): List<Binding> {
            val declarationKind = kindOf(declaration)
            val group = declaration.getChildByFieldName(BODY_FIELD).orNull()?.takeIf { it.type == NAMESPACE_USE_GROUP }
            if (group == null) {
                return declaration
                    .namedChildren()
                    .filter { it.type == NAMESPACE_USE_CLAUSE }
                    .mapNotNull { clause ->
                        bindingOf(clause, emptyList(), kindOf(clause).takeIf { it != Kind.CLASS } ?: declarationKind)
                    }.toList()
            }
            val prefix = declaration.namedChildren().firstOrNull { it.type == NAMESPACE_NAME }?.let { segmentsOf(it.text) }.orEmpty()
            return group
                .namedChildren()
                .filter { it.type == NAMESPACE_USE_CLAUSE }
                .mapNotNull { clause ->
                    bindingOf(clause, prefix, kindOf(clause).takeIf { it != Kind.CLASS } ?: declarationKind)
                }.toList()
        }

        private fun bindingOf(clause: SyntaxNode, prefix: List<String>, kind: Kind): Binding? {
            val name = clause.namedChildren().firstOrNull { it.type == QUALIFIED_NAME || it.type == NAME } ?: return null
            val path = prefix + segmentsOf(name.text)
            val alias = clause.getChildByFieldName(ALIAS_FIELD).orNull()?.text ?: path.last()
            return Binding(kind, alias, path)
        }

        private fun kindOf(node: SyntaxNode): Kind = when (node.getChildByFieldName(TYPE_FIELD).orNull()?.text?.lowercase()) {
            FUNCTION_KEYWORD -> Kind.FUNCTION
            CONSTANT_KEYWORD -> Kind.CONSTANT
            else -> Kind.CLASS
        }

        private fun segmentsOf(name: String): List<String> = name.trimStart('\\').split(NamespaceUses.NAMESPACE_SEPARATOR)
    }
}
