package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal sealed interface DefaultExport {
    data class Named(val name: String) : DefaultExport // export default class Foo {}

    data class Reexport(val name: String) : DefaultExport // export default Foo;

    data object Anonymous : DefaultExport // export default class {}

    data object Value : DefaultExport // export default { ... } / 42

    data object None : DefaultExport // no export default
}

internal object DefaultExportClassifier {
    internal fun classify(rootNode: SyntaxNode): DefaultExport = rootNode
        .children()
        .filter { it.type == EXPORT_STATEMENT }
        .firstNotNullOfOrNull { exportNode ->
            val children = exportNode.children().toList()
            if (!children.any { it.type == DEFAULT_KEYWORD }) return@firstNotNullOfOrNull null
            val identifier = children.firstOrNull { it.type == IDENTIFIER }
            if (identifier != null) {
                return@firstNotNullOfOrNull DefaultExport.Reexport(identifier.text.trim())
            }
            val declarationChild = children.firstOrNull { it.type in DECLARATION_NODE_TYPES }
            if (declarationChild != null) {
                val name = extractDeclarationName(declarationChild)
                return@firstNotNullOfOrNull if (name.isNotBlank()) DefaultExport.Named(name) else DefaultExport.Anonymous
            }
            DefaultExport.Value
        } ?: DefaultExport.None
}
