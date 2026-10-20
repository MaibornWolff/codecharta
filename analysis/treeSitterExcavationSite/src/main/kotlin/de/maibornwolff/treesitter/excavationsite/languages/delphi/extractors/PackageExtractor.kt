package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object PackageExtractor {
    private const val UNIT = "unit"
    private const val PROGRAM = "program"
    private const val LIBRARY = "library"
    private const val MODULE_NAME = "moduleName"
    private const val IDENTIFIER = "identifier"

    private val CONTAINERS = setOf(UNIT, PROGRAM, LIBRARY)
    private val KEYWORD_FALLBACK = setOf("kUnit", "kProgram", "kLibrary")

    // The fallbacks exist because tree-sitter-pascal 0.10.2 nests the unit under ERROR, or emits only a raw `kUnit`
    // and `moduleName` inside ERROR, when `{$IF}`-gated inline `asm` blocks are dense (Spring4D, e.g. Spring.pas).
    fun extract(rootNode: SyntaxNode): List<String> {
        val moduleNameNode = findModuleNameViaContainerAtRoot(rootNode)
            ?: findModuleNameViaContainerDescendant(rootNode)
            ?: findModuleNameViaKeywordSibling(rootNode)
            ?: return emptyList()

        return readDottedIdentifiers(moduleNameNode)
    }

    private fun findModuleNameViaContainerAtRoot(rootNode: SyntaxNode): SyntaxNode? {
        val container = rootNode.children().firstOrNull { it.type in CONTAINERS } ?: return null
        return container.children().firstOrNull { it.type == MODULE_NAME }
    }

    private fun findModuleNameViaContainerDescendant(rootNode: SyntaxNode): SyntaxNode? {
        val container = TreeTraversal.findAllDescendantsOfType(rootNode, *CONTAINERS.toTypedArray()).firstOrNull()
            ?: return null
        return container.children().firstOrNull { it.type == MODULE_NAME }
    }

    private fun findModuleNameViaKeywordSibling(rootNode: SyntaxNode): SyntaxNode? {
        val keyword = TreeTraversal.findAllDescendantsOfType(rootNode, *KEYWORD_FALLBACK.toTypedArray()).firstOrNull()
            ?: return null
        val parent = keyword.parent
        if (parent.isNull) return null
        return parent.children().firstOrNull {
            it.type == MODULE_NAME && it.startByte >= keyword.endByte
        }
    }

    private fun readDottedIdentifiers(moduleNameNode: SyntaxNode): List<String> = moduleNameNode
        .children()
        .filter { it.type == IDENTIFIER }
        .map { it.text }
        .toList()
}
