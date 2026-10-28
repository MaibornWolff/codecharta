package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The top-level names a JavaScript or TypeScript module exports: those an `export` statement declares or lists, the one
 * `export default` or `export =` names, and those a CommonJS `module.exports` or `exports.name` assignment names. Any
 * other top-level declaration of a module only its own file can name. A file without any import, export or CommonJS
 * module code is a script, whose declarations are global.
 */
internal class ExportedNames private constructor(private val names: Set<String>, private val isModule: Boolean) {
    /** Whether the file is a script: without any import, export or CommonJS module code. */
    val isScript: Boolean get() = !isModule

    fun isFileScoped(name: String): Boolean = isModule && name !in names

    companion object {
        private const val SHORTHAND_PROPERTY_IDENTIFIER = "shorthand_property_identifier"

        fun of(rootNode: SyntaxNode): ExportedNames {
            val statements = rootNode.children().toList()
            val exportStatements = statements.filter { it.type == EXPORT_STATEMENT }
            val commonJsValues = statements.mapNotNull { CommonJsExports.valueOf(it) }
            val isModule = exportStatements.isNotEmpty() ||
                commonJsValues.isNotEmpty() ||
                statements.any { it.type == IMPORT_STATEMENT } ||
                callsRequire(rootNode)
            val names = exportStatements.flatMap { namesExportedBy(it) } + commonJsValues.flatMap { namesIn(it) }
            return ExportedNames(names.toSet(), isModule)
        }

        private fun namesExportedBy(exportStatement: SyntaxNode): List<String> {
            if (hasSource(exportStatement)) return emptyList()
            val clause = exportStatement.children().firstOrNull { it.type == EXPORT_CLAUSE }
            if (clause != null) return localNamesOf(clause)
            val declarations = exportStatement.children().flatMap { declarationsOf(it) }.toList()
            if (declarations.isNotEmpty()) return declarations.flatMap { declaredNames(it) }
            return exportStatement.children().filter { it.type == IDENTIFIER }.map { it.text.trim() }.toList()
        }

        private fun localNamesOf(clause: SyntaxNode): List<String> = clause
            .children()
            .filter { it.type == EXPORT_SPECIFIER }
            .mapNotNull { specifier -> specifier.children().firstOrNull { it.type == IDENTIFIER }?.text?.trim() }
            .toList()

        private fun declaredNames(declaration: SyntaxNode): List<String> {
            if (declaration.type != LEXICAL_DECLARATION && declaration.type != VARIABLE_DECLARATION) {
                return listOf(extractDeclarationName(declaration))
            }
            return declaration
                .children()
                .filter { it.type == VARIABLE_DECLARATOR }
                .flatMap { BindingPatterns.declaredNames(it) }
                .toList()
        }

        private fun namesIn(value: SyntaxNode): List<String> = when (value.type) {
            IDENTIFIER -> listOf(value.text.trim())
            OBJECT -> value.namedChildren().mapNotNull { property -> propertyValueName(property) }.toList()
            else -> emptyList()
        }

        private fun propertyValueName(property: SyntaxNode): String? = when (property.type) {
            SHORTHAND_PROPERTY_IDENTIFIER -> property.text.trim()
            PAIR ->
                property
                    .getChildByFieldName(VALUE_FIELD)
                    .orNull()
                    ?.takeIf { it.type == IDENTIFIER }
                    ?.text
                    ?.trim()
            else -> null
        }

        private fun callsRequire(rootNode: SyntaxNode): Boolean = TreeTraversal
            .findAllDescendantsOfType(rootNode, CALL_EXPRESSION)
            .any { call -> call.children().firstOrNull()?.let { it.type == IDENTIFIER && it.text == REQUIRE } == true }
    }
}
