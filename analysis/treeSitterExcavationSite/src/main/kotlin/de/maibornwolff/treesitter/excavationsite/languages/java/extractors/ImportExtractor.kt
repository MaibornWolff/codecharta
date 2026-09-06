package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object ImportExtractor {
    private const val IMPORT_DECLARATION = "import_declaration"
    private const val ASTERISK = "asterisk"
    private const val SCOPED_IDENTIFIER = "scoped_identifier"
    private const val IDENTIFIER = "identifier"
    private const val IMPORT_SEPARATOR = "."

    fun extract(rootNode: TSNode, sourceCode: String): List<ImportDeclaration> = rootNode
        .children()
        .filter { it.type == IMPORT_DECLARATION }
        .map { importNode ->
            val isWildcard = importNode.children().any { it.type == ASTERISK }
            val identifierText = TreeTraversal.findFirstChildTextByType(importNode, sourceCode, SCOPED_IDENTIFIER, IDENTIFIER)
            val path = identifierText?.split(IMPORT_SEPARATOR) ?: emptyList()
            ImportDeclaration(path = path, isWildcard = isWildcard)
        }.toList()
}
