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
    fun isFileScoped(name: String): Boolean = isModule && name !in names

    companion object {
        private const val EXPRESSION_STATEMENT = "expression_statement"
        private const val ASSIGNMENT_EXPRESSION = "assignment_expression"
        private const val MEMBER_EXPRESSION = "member_expression"
        private const val SHORTHAND_PROPERTY_IDENTIFIER = "shorthand_property_identifier"
        private const val LEFT_FIELD = "left"
        private const val RIGHT_FIELD = "right"
        private const val OBJECT_FIELD = "object"
        private const val MODULE_EXPORTS = "module.exports"
        private const val EXPORTS = "exports"

        fun of(rootNode: SyntaxNode): ExportedNames {
            val statements = rootNode.children().toList()
            val exportStatements = statements.filter { it.type == EXPORT_STATEMENT }
            val commonJsValues = statements.mapNotNull { commonJsExportValue(it) }
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
            val declarations = exportStatement.children().filter { it.type in DECLARATION_NODE_TYPES }.toList()
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
                .mapNotNull { TreeTraversal.findFirstChildTextByType(it, IDENTIFIER)?.trim() }
                .toList()
        }

        // The value of `module.exports = …`, `module.exports.name = …` or `exports.name = …`
        private fun commonJsExportValue(statement: SyntaxNode): SyntaxNode? {
            if (statement.type != EXPRESSION_STATEMENT) return null
            val assignment = statement.namedChildren().firstOrNull { it.type == ASSIGNMENT_EXPRESSION } ?: return null
            val target = assignment.getChildByFieldName(LEFT_FIELD).orNull() ?: return null
            if (!isCommonJsExport(target)) return null
            return assignment.getChildByFieldName(RIGHT_FIELD).orNull()
        }

        private fun isCommonJsExport(target: SyntaxNode): Boolean {
            if (target.type != MEMBER_EXPRESSION) return false
            if (target.text == MODULE_EXPORTS) return true
            val holder = target.getChildByFieldName(OBJECT_FIELD).orNull() ?: return false
            return holder.text == EXPORTS || holder.text == MODULE_EXPORTS
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
