package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

internal sealed interface DefaultExport {
    data class Named(val name: String) : DefaultExport // export default class Foo {}

    data class Reexport(val name: String) : DefaultExport // export default Foo;

    data class Anonymous(val type: DeclarationType) : DefaultExport // export default class {} / { ... } / () => 1

    data object None : DefaultExport // no export default
}

internal object DefaultExportClassifier {
    private const val VALUE_FIELD = "value"
    private val CLASS_VALUES = setOf("class", CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION)
    private val FUNCTION_VALUES = setOf("function_expression", "function", "arrow_function", "generator_function", FUNCTION_DECLARATION)

    internal fun classify(rootNode: SyntaxNode): DefaultExport {
        val exportNode = defaultExportStatement(rootNode) ?: return DefaultExport.None
        val identifier = exportNode.children().firstOrNull { it.type == IDENTIFIER }
        if (identifier != null) return DefaultExport.Reexport(identifier.text.trim())
        val name = exportNode.children().firstOrNull { it.type in DECLARATION_NODE_TYPES }?.let { extractDeclarationName(it) }.orEmpty()
        if (name.isNotBlank()) return DefaultExport.Named(name)
        return anonymousValue(rootNode)?.let { DefaultExport.Anonymous(typeOf(it)) } ?: DefaultExport.None
    }

    /** The class, function or value an anonymous `export default` exports. */
    internal fun anonymousValue(rootNode: SyntaxNode): SyntaxNode? {
        val exportNode = defaultExportStatement(rootNode) ?: return null
        return exportNode.children().firstOrNull { it.type in DECLARATION_NODE_TYPES }
            ?: exportNode.getChildByFieldName(VALUE_FIELD).orNull()
    }

    private fun defaultExportStatement(rootNode: SyntaxNode): SyntaxNode? = rootNode
        .children()
        .firstOrNull { statement -> statement.type == EXPORT_STATEMENT && statement.children().any { it.type == DEFAULT_KEYWORD } }

    private fun typeOf(value: SyntaxNode): DeclarationType = when (value.type) {
        in CLASS_VALUES -> DeclarationType.CLASS
        in FUNCTION_VALUES -> DeclarationType.FUNCTION
        else -> DeclarationType.VARIABLE
    }
}
