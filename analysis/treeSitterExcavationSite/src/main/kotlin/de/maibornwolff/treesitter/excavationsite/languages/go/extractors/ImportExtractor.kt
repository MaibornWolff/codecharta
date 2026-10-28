package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * One import per import spec with an interpreted string as its path, split at the slashes. A dot import
 * (`import . "fmt"`) is a wildcard: it makes every exported name of the package available unqualified. An alias
 * (`import log "…"`) or the blank identifier `_` is the import's binding name.
 */
internal object ImportExtractor {
    private const val IMPORT_DECLARATION = "import_declaration"
    private const val IMPORT_SPEC = "import_spec"
    private const val DOT = "dot"
    private const val PACKAGE_IDENTIFIER = "package_identifier"
    private const val BLANK_IDENTIFIER = "blank_identifier"
    private const val INTERPRETED_STRING_LITERAL = "interpreted_string_literal"
    private const val PATH_SEPARATOR = "/"
    private const val QUOTE = '"'

    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, IMPORT_DECLARATION)
        .flatMap { importDeclaration -> TreeTraversal.findAllDescendantsOfType(importDeclaration, IMPORT_SPEC) }
        .mapNotNull { importSpec -> toImport(importSpec) }

    private fun toImport(importSpec: SyntaxNode): ImportDeclaration? {
        var importPath = ""
        var isDotImport = false
        var bindingName: String? = null
        importSpec.children().forEach { child ->
            when (child.type) {
                DOT -> isDotImport = true
                PACKAGE_IDENTIFIER, BLANK_IDENTIFIER -> bindingName = child.text
                INTERPRETED_STRING_LITERAL -> importPath = child.text.trim(QUOTE)
            }
        }
        if (importPath.isEmpty()) return null
        val path = importPath.split(PATH_SEPARATOR).filter { it.isNotEmpty() }
        return ImportDeclaration(path = path, isWildcard = isDotImport, bindingName = bindingName)
    }
}
