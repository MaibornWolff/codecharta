package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.DEFAULT_EXPORT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.DEFAULT_KEYWORD
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.DECLARATION_NODE_TYPES
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.extractName
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object DeclarationExtractor {
    private const val AMBIENT_DECLARATION = "ambient_declaration"

    internal sealed interface DefaultExport {
        data class Named(val name: String) : DefaultExport // export default class Foo {}

        data class Reexport(val name: String) : DefaultExport // export default Foo;

        data object Anonymous : DefaultExport // export default class {}

        data object Value : DefaultExport // export default { ... } / 42

        data object None : DefaultExport // no export default
    }

    internal fun classifyDefaultExport(rootNode: TSNode, sourceCode: String): DefaultExport = rootNode
        .children()
        .filter { it.type == EXPORT_STATEMENT }
        .firstNotNullOfOrNull { classifyExportStatement(it, sourceCode) } ?: DefaultExport.None

    private fun classifyExportStatement(exportNode: TSNode, sourceCode: String): DefaultExport? {
        val children = exportNode.children().toList()
        if (!children.any { it.type == DEFAULT_KEYWORD }) return null
        val identifier = children.firstOrNull { it.type == IDENTIFIER }
        if (identifier != null) return DefaultExport.Reexport(TreeTraversal.getNodeText(identifier, sourceCode).trim())
        val declarationChild = children.firstOrNull { it.type in DECLARATION_NODE_TYPES } ?: return DefaultExport.Value
        val name = extractName(declarationChild, sourceCode)
        return if (name.isNotBlank()) DefaultExport.Named(name) else DefaultExport.Anonymous
    }

    fun extract(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val imports = ImportExtractor.extract(rootNode, sourceCode)
        val scope = DeclarationScope(
            sourceCode = sourceCode,
            aliasMap = DeclarationPrepass.buildAliasMap(imports),
            localDeclarationNames = DeclarationPrepass.extractLocalDeclarationNames(rootNode, sourceCode)
        )
        val declarations = rootNode
            .children()
            .flatMap { child -> extractTopLevel(child, scope) }
            .filter { it.name.isNotBlank() }
            .toList()
        return declarations + defaultExportDeclarations(classifyDefaultExport(rootNode, sourceCode), declarations)
    }

    private fun extractTopLevel(node: TSNode, scope: DeclarationScope): List<Declaration> = when (node.type) {
        EXPORT_STATEMENT -> ExportStatementExtractor.extractFromExportStatement(node, scope)
        AMBIENT_DECLARATION -> ExportStatementExtractor.extractFromAmbientDeclaration(node, scope)
        in DECLARATION_NODE_TYPES -> DeclarationNodeExtractor.extract(node, scope)
        else -> emptyList()
    }

    private fun defaultExportDeclarations(shape: DefaultExport, declarations: List<Declaration>): List<Declaration> = when (shape) {
        is DefaultExport.Reexport -> {
            val resolvedType = declarations.firstOrNull { it.name == shape.name }?.type
                ?: DeclarationType.REEXPORT
            listOf(Declaration(DEFAULT_EXPORT, resolvedType, setOf(UsedType(shape.name))))
        }
        is DefaultExport.Anonymous, DefaultExport.Value ->
            listOf(Declaration(DEFAULT_EXPORT, DeclarationType.REEXPORT, emptySet()))
        is DefaultExport.Named, DefaultExport.None -> emptyList()
    }
}
