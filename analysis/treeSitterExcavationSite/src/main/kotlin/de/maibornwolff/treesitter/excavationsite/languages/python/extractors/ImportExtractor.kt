package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The imports of a Python file, wherever they stand, in source order.
 *
 * - `import a.b` and `import a.b as c` are [ImportKind.STANDARD] with the path `[a, b]`, the alias as binding name.
 * - `from a.b import C` is [ImportKind.MEMBER] with the path `[a, b, C]`, `from a.b import *` a wildcard with the
 *   path `[a, b]`. The imported name is one segment, split at no dot.
 * - A relative module starts with one `.` segment per leading dot: `from ..a import C` is `[., ., a, C]`. The
 *   consumer resolves them against the path of the file.
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
    private const val PARENT_LEVEL = "."
    private val ONLY_DOTS = Regex("^[.]+$")

    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, IMPORT_STATEMENT, IMPORT_FROM_STATEMENT)
        .flatMap { statement -> if (statement.type == IMPORT_STATEMENT) moduleImports(statement) else memberImports(statement) }

    private fun moduleImports(statement: SyntaxNode): List<ImportDeclaration> {
        val children = statement.children().toList()
        val modules = children.filter { it.type == DOTTED_NAME }.map { ImportDeclaration(path = segmentsOf(it.text), isWildcard = false) }
        val aliasedModules = aliasesOf(children).map { (alias, name) ->
            ImportDeclaration(path = segmentsOf(name), isWildcard = false, bindingName = alias)
        }
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
        val aliasedMembers = aliasesOf(importedNames).map { (alias, name) -> memberImport(module + name, alias) }
        return members + wildcards + aliasedMembers
    }

    private fun memberImport(path: List<String>, alias: String? = null) =
        ImportDeclaration(path = path, isWildcard = false, kind = ImportKind.MEMBER, bindingName = alias)

    // An alias without a name or a name without an alias only comes out of broken code, where none can be trusted
    private fun aliasesOf(importedNames: List<SyntaxNode>): List<Pair<String, String>> {
        val aliasedImports = importedNames.filter { it.type == ALIASED_IMPORT }
        val aliases = aliasedImports.mapNotNull {
            it
                .getChildByFieldName(ALIAS_FIELD)
                .orNull()
                ?.takeIf { alias ->
                    alias.type == IDENTIFIER
                }?.text
        }
        val names = aliasedImports.mapNotNull {
            it
                .getChildByFieldName(NAME_FIELD)
                .orNull()
                ?.takeIf { name ->
                    name.type == DOTTED_NAME
                }?.text
        }
        return if (aliases.size == names.size) aliases.zip(names) else emptyList()
    }

    private fun moduleSegmentsOf(statement: SyntaxNode): List<String>? {
        val module = statement.getChildByFieldName(MODULE_NAME_FIELD).orNull() ?: return null
        if (module.type == DOTTED_NAME) return segmentsOf(module.text)
        if (module.type != RELATIVE_IMPORT) return null
        val prefix = TreeTraversal.findAllChildrenTextByType(module, IMPORT_PREFIX).singleOrNull() ?: return null
        val moduleNames = TreeTraversal.findAllChildrenTextByType(module, DOTTED_NAME)
        if (!ONLY_DOTS.matches(prefix) || moduleNames.size > 1) return null
        return List(prefix.length) { PARENT_LEVEL } + moduleNames.flatMap { segmentsOf(it) }
    }

    private fun segmentsOf(dottedName: String): List<String> = dottedName.split(SEGMENT_SEPARATOR)
}
