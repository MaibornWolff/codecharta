package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The imports of a Python file, wherever they stand: statements in source order, within a statement plain names
 * before aliased ones.
 *
 * - `import a.b` and `import a.b as c` are [ImportKind.STANDARD] with the path `[a, b]`, the alias as binding name.
 * - `from a.b import C` is [ImportKind.MEMBER] with the path `[a, b, C]`, `from a.b import *` a wildcard with the
 *   path `[a, b]`. The imported name is one segment, split at no dot.
 * - A relative module starts with one `.` segment per leading dot: `from ..a import C` is `[., ., a, C]`.
 */
internal object ImportExtractor {
    private const val IMPORT_STATEMENT = "import_statement"
    private const val IMPORT_FROM_STATEMENT = "import_from_statement"
    private const val IMPORT_KEYWORD = "import"
    private const val DOTTED_NAME = "dotted_name"
    private const val ALIASED_IMPORT = "aliased_import"
    private const val WILDCARD_IMPORT = "wildcard_import"
    private const val RELATIVE_IMPORT = "relative_import"
    private const val IMPORT_PREFIX = "import_prefix"
    private const val IDENTIFIER = "identifier"
    private const val MODULE_NAME_FIELD = "module_name"
    private const val NAME_FIELD = "name"
    private const val ALIAS_FIELD = "alias"
    private const val SEGMENT_SEPARATOR = "."
    private const val RELATIVE_LEVEL = "."
    private val ONLY_DOTS = Regex("^[.]+$")

    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, IMPORT_STATEMENT, IMPORT_FROM_STATEMENT)
        .flatMap { importsOf(it) }

    /** The imports of one import statement, none for another statement. */
    fun importsOf(statement: SyntaxNode): List<ImportDeclaration> = when (statement.type) {
        IMPORT_STATEMENT -> moduleImports(statement)
        IMPORT_FROM_STATEMENT -> memberImports(statement)
        else -> emptyList()
    }

    private fun moduleImports(statement: SyntaxNode): List<ImportDeclaration> {
        val children = statement.children().toList()
        val modules = children.filter { it.type == DOTTED_NAME }.map { ImportDeclaration(path = segmentsOf(it.text), isWildcard = false) }
        val aliasedModules = aliasesOf(
            children
        ).map { ImportDeclaration(path = segmentsOf(it.name), isWildcard = false, bindingName = it.alias) }
        return modules + aliasedModules
    }

    private fun memberImports(statement: SyntaxNode): List<ImportDeclaration> {
        val module = moduleSegmentsOf(statement) ?: return emptyList()
        val children = statement.children().toList()
        val importedNames = children.dropWhile { it.type != IMPORT_KEYWORD }
        val members = importedNames.filter { it.type == DOTTED_NAME }.map { memberImport(module + it.text) }
        val wildcards = children.filter { it.type == WILDCARD_IMPORT }.map {
            ImportDeclaration(path = module, isWildcard = true, kind = ImportKind.MEMBER)
        }
        val aliasedMembers = aliasesOf(importedNames).map { memberImport(module + it.name, it.alias) }
        return members + wildcards + aliasedMembers
    }

    private fun memberImport(path: List<String>, alias: String? = null) =
        ImportDeclaration(path = path, isWildcard = false, kind = ImportKind.MEMBER, bindingName = alias)

    // An alias without a name or a name without an alias only comes out of broken code, where none can be trusted
    private fun aliasesOf(importedNames: List<SyntaxNode>): List<Alias> {
        val aliasedImports = importedNames.filter { it.type == ALIASED_IMPORT }
        val aliases = aliasedImports.mapNotNull { it.fieldOfType(ALIAS_FIELD, IDENTIFIER)?.text }
        val names = aliasedImports.mapNotNull { it.fieldOfType(NAME_FIELD, DOTTED_NAME)?.text }
        if (aliases.size != names.size) return emptyList()
        return aliases.zip(names) { alias, name -> Alias(alias, name) }
    }

    private fun moduleSegmentsOf(statement: SyntaxNode): List<String>? {
        val module = statement.getChildByFieldName(MODULE_NAME_FIELD).orNull() ?: return null
        if (module.type == DOTTED_NAME) return segmentsOf(module.text)
        if (module.type != RELATIVE_IMPORT) return null
        val prefix = TreeTraversal.findAllChildrenTextByType(module, IMPORT_PREFIX).singleOrNull() ?: return null
        val moduleNames = TreeTraversal.findAllChildrenTextByType(module, DOTTED_NAME)
        if (!ONLY_DOTS.matches(prefix) || moduleNames.size > 1) return null
        return List(prefix.length) { RELATIVE_LEVEL } + moduleNames.flatMap { segmentsOf(it) }
    }

    private fun segmentsOf(dottedName: String): List<String> = dottedName.split(SEGMENT_SEPARATOR)

    private class Alias(val alias: String, val name: String)
}
