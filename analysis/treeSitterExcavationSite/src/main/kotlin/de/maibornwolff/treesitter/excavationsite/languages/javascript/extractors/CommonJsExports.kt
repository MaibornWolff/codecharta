package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The CommonJS export statements of a module: `module.exports = …`, `module.exports.name = …` and `exports.name = …`. */
internal object CommonJsExports {
    private const val EXPRESSION_STATEMENT = "expression_statement"
    private const val ASSIGNMENT_EXPRESSION = "assignment_expression"
    private const val MEMBER_EXPRESSION = "member_expression"
    private const val LEFT_FIELD = "left"
    private const val RIGHT_FIELD = "right"
    private const val OBJECT_FIELD = "object"
    private const val MODULE_EXPORTS = "module.exports"
    private const val EXPORTS = "exports"

    /** The value a top-level statement exports, null for a statement that is no CommonJS export. */
    fun valueOf(statement: SyntaxNode): SyntaxNode? {
        if (statement.type != EXPRESSION_STATEMENT) return null
        val assignment = statement.namedChildren().firstOrNull { it.type == ASSIGNMENT_EXPRESSION } ?: return null
        val target = assignment.getChildByFieldName(LEFT_FIELD).orNull() ?: return null
        if (!isExportTarget(target)) return null
        return assignment.getChildByFieldName(RIGHT_FIELD).orNull()
    }

    /** The value `module.exports = …` gives the whole module, its default export; null for any other statement. */
    fun moduleValueOf(statement: SyntaxNode): SyntaxNode? {
        val value = valueOf(statement) ?: return null
        return value.takeIf { it.parent.getChildByFieldName(LEFT_FIELD).text == MODULE_EXPORTS }
    }

    private fun isExportTarget(target: SyntaxNode): Boolean {
        if (target.type != MEMBER_EXPRESSION) return false
        if (target.text == MODULE_EXPORTS) return true
        val holder = target.getChildByFieldName(OBJECT_FIELD).orNull() ?: return false
        return holder.text == EXPORTS || holder.text == MODULE_EXPORTS
    }
}
