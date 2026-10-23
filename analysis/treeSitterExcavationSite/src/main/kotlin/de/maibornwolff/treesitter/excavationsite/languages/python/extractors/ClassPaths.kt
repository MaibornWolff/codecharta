package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The path below the module of a Python class that is a declaration: a top-level class, or one nested in such a class body. */
internal object ClassPaths {
    private const val MODULE = "module"
    private const val BLOCK = "block"
    private const val CLASS_DEFINITION = "class_definition"
    private const val DECORATED_DEFINITION = "decorated_definition"
    private const val NAME_FIELD = "name"

    /** Null for a class declared in a function or in a block of another statement, which no other declaration can name. */
    fun of(classDefinition: SyntaxNode): List<String>? {
        val name = classDefinition.getChildByFieldName(NAME_FIELD).orNull()?.text ?: return null
        val container = containerOf(classDefinition)
        return when {
            container.type == MODULE -> listOf(name)
            container.type == BLOCK && container.parent.type == CLASS_DEFINITION -> of(container.parent)?.plus(name)
            else -> null
        }
    }

    private fun containerOf(classDefinition: SyntaxNode): SyntaxNode =
        classDefinition.parent.let { if (it.type == DECORATED_DEFINITION) it.parent else it }
}
