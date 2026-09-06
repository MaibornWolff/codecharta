package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts the package (unit) path from a Delphi file.
 *
 * Delphi files can be:
 *   - `unit MyCo.MyMod.Utils;` → `["MyCo", "MyMod", "Utils"]`
 *   - `program MyApp;` → `["MyApp"]`
 *   - `library MyLib;` → `["MyLib"]`
 *   - bare `.dpr` program without a module name → `emptyList()`
 *
 * The module name follows the `kUnit`/`kProgram`/`kLibrary` keyword and is stored
 * in a `moduleName` node whose children are dotted `identifier`s.
 *
 * Resolution proceeds in three stages so that files which tree-sitter-pascal
 * cannot wrap correctly still produce a usable package path:
 *
 *   1. Happy path — direct `unit`/`program`/`library` child of root.
 *   2. Descendant fallback — same wrapper found anywhere in the tree (covers
 *      cases where the wrapper exists but is nested under an ERROR).
 *   3. Keyword-token fallback — `kUnit`/`kProgram`/`kLibrary` raw keyword found
 *      inside an ERROR subtree, with `moduleName` appearing as a positional
 *      sibling. Triggered by Spring4D files like `Spring.Comparers.pas`,
 *      `Spring.pas`, `Spring.Utils.pas`, and several `Spring.Collections.*`
 *      units, where dense inline `asm … end;` blocks gated by
 *      `{$IF}/{$IFDEF}` directives cause tree-sitter-pascal 0.10.2 to wrap
 *      the entire unit body in a top-level ERROR node and emit `kUnit` plus
 *      `moduleName` as raw children of that ERROR rather than as a `unit` node.
 */
internal object PackageExtractor {
    private const val UNIT = "unit"
    private const val PROGRAM = "program"
    private const val LIBRARY = "library"
    private const val MODULE_NAME = "moduleName"
    private const val IDENTIFIER = "identifier"

    private val CONTAINERS = setOf(UNIT, PROGRAM, LIBRARY)
    private val KEYWORD_FALLBACK = setOf("kUnit", "kProgram", "kLibrary")

    fun extract(rootNode: TSNode, sourceCode: String): List<String> {
        val moduleNameNode = findModuleNameViaContainerAtRoot(rootNode)
            ?: findModuleNameViaContainerDescendant(rootNode)
            ?: findModuleNameViaKeywordSibling(rootNode)
            ?: return emptyList()

        return readDottedIdentifiers(moduleNameNode, sourceCode)
    }

    private fun findModuleNameViaContainerAtRoot(rootNode: TSNode): TSNode? {
        val container = rootNode.children().firstOrNull { it.type in CONTAINERS } ?: return null
        return container.children().firstOrNull { it.type == MODULE_NAME }
    }

    private fun findModuleNameViaContainerDescendant(rootNode: TSNode): TSNode? {
        val container = TreeTraversal.findAllDescendantsOfType(rootNode, *CONTAINERS.toTypedArray()).firstOrNull()
            ?: return null
        return container.children().firstOrNull { it.type == MODULE_NAME }
    }

    private fun findModuleNameViaKeywordSibling(rootNode: TSNode): TSNode? {
        val keyword = TreeTraversal.findAllDescendantsOfType(rootNode, *KEYWORD_FALLBACK.toTypedArray()).firstOrNull()
            ?: return null
        val parent = keyword.parent ?: return null
        return parent.children().firstOrNull {
            it.type == MODULE_NAME && it.startByte >= keyword.endByte
        }
    }

    private fun readDottedIdentifiers(moduleNameNode: TSNode, sourceCode: String): List<String> = moduleNameNode
        .children()
        .filter { it.type == IDENTIFIER }
        .map { TreeTraversal.getNodeText(it, sourceCode) }
        .toList()
}
