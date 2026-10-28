package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

internal sealed interface DefaultExport {
    data class Named(val name: String) : DefaultExport // export default class Foo {}

    data class Reexport(val name: String) : DefaultExport // export default Foo;

    data class Anonymous(val type: DeclarationType) : DefaultExport // export default class {} / { ... } / () => 1

    data object None : DefaultExport // no export default, or module.exports = { … }, which exports names
}

internal object DefaultExportClassifier {
    private const val VALUE_FIELD = "value"
    private const val EXPORT_ASSIGNMENT = "="
    private val CLASS_VALUES = setOf("class", CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION)
    private val FUNCTION_VALUES = setOf("function_expression", "function", "arrow_function", "generator_function", FUNCTION_DECLARATION)

    internal fun classify(rootNode: SyntaxNode): DefaultExport {
        val exportNode = defaultExportStatement(rootNode) ?: return commonJsDefault(rootNode)
        val identifier = exportNode.children().firstOrNull { it.type == IDENTIFIER }
        if (identifier != null) return DefaultExport.Reexport(identifier.text.trim())
        val name = exportNode.children().firstOrNull { it.type in DECLARATION_NODE_TYPES }?.let { extractDeclarationName(it) }.orEmpty()
        if (name.isNotBlank()) return DefaultExport.Named(name)
        return anonymousValue(rootNode)?.let { DefaultExport.Anonymous(typeOf(it)) } ?: DefaultExport.None
    }

    /** The class, function or value an anonymous `export default` or `module.exports =` exports. */
    internal fun anonymousValue(rootNode: SyntaxNode): SyntaxNode? {
        val exportNode = defaultExportStatement(rootNode) ?: return commonJsDefaultValue(rootNode)
        return exportNode.children().firstOrNull { it.type in DECLARATION_NODE_TYPES }
            ?: exportNode.getChildByFieldName(VALUE_FIELD).orNull()
    }

    // `export default …` and the TypeScript export assignment `export = …`
    private fun defaultExportStatement(rootNode: SyntaxNode): SyntaxNode? = rootNode
        .children()
        .firstOrNull { statement ->
            statement.type == EXPORT_STATEMENT && statement.children().any { it.type == DEFAULT_KEYWORD || it.type == EXPORT_ASSIGNMENT }
        }

    // `module.exports = X` exports X as the default export, `module.exports = { A, … }` names A as an export instead
    private fun commonJsDefault(rootNode: SyntaxNode): DefaultExport {
        val value = commonJsDefaultValue(rootNode) ?: return DefaultExport.None
        return when (value.type) {
            IDENTIFIER -> DefaultExport.Reexport(value.text.trim())
            OBJECT -> DefaultExport.None
            else -> DefaultExport.Anonymous(typeOf(value))
        }
    }

    // The last assignment wins, as at runtime
    private fun commonJsDefaultValue(rootNode: SyntaxNode): SyntaxNode? =
        rootNode.namedChildren().mapNotNull { CommonJsExports.moduleValueOf(it) }.lastOrNull()

    private fun typeOf(value: SyntaxNode): DeclarationType = when (value.type) {
        in CLASS_VALUES -> DeclarationType.CLASS
        in FUNCTION_VALUES -> DeclarationType.FUNCTION
        else -> DeclarationType.VARIABLE
    }
}
