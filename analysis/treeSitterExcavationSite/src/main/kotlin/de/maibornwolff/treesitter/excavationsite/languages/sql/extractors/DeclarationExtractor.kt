package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * The objects a SQL script creates, each with the objects it uses, plus one [DeclarationType.SCRIPT] declaration for
 * what the statements outside any definition use.
 *
 * SQL has no imports: an object is used by its name, which the dependency parser resolves across all files. Names
 * are lower case, as SQL compares unquoted names case-insensitively, and keep at most their last two parts, the
 * schema or package and the object. A definition inside a routine (a temporary table, say) is part of the routine,
 * and a routine inside a package is declared with the package as its parent.
 */
internal object DeclarationExtractor {
    private const val CREATE_KEYWORD = "CREATE"
    private const val PACKAGE_DEFINITION = "package_definition"
    private const val ROUTINE_DEFINITION = "routine_definition"
    private const val ROUTINE_DECLARATION = "routine_declaration"
    private const val COMMON_TABLE_EXPRESSION = "common_table_expression"
    private const val NAME_PART_SEPARATOR = "."
    private const val USED_NAME_PARTS = 2
    private const val OBJECT_REFERENCE = "object_reference"
    private const val INVOCATION = "invocation"
    private val TYPE_HOLDERS = setOf("column_definition", "parameter")
    private val DEFINITION_TYPES = mapOf(
        "table_definition" to DeclarationType.CLASS,
        "view_definition" to DeclarationType.CLASS,
        PACKAGE_DEFINITION to DeclarationType.CLASS,
        ROUTINE_DEFINITION to DeclarationType.FUNCTION,
        ROUTINE_DECLARATION to DeclarationType.FUNCTION
    )

    // Variables, temporary tables and template placeholders name no object of the database
    private val PREFIXES_OF_NO_OBJECT = listOf("@", ":", "#", "{{")

    fun extract(root: SyntaxNode): List<Declaration> {
        val script = DeclarationBuilder(name = "", type = DeclarationType.SCRIPT)
        val definitions = mutableListOf<DeclarationBuilder>()
        visit(root, Scope(script, holdsTypes = false), definitions)
        val declarations = definitions.map { it.build() }
        return if (script.usesAnything()) declarations + script.build() else declarations
    }

    /** Where a node is: the declaration its uses count for, and whether it is inside a column or parameter. */
    private class Scope(val owner: DeclarationBuilder, val holdsTypes: Boolean)

    private fun visit(node: SyntaxNode, scope: Scope, definitions: MutableList<DeclarationBuilder>) {
        val definition = definitionStartedBy(node, scope.owner)
        definition?.let { definitions.add(it) }
        val innerScope = Scope(definition ?: scope.owner, scope.holdsTypes || node.type in TYPE_HOLDERS)
        record(node, innerScope)
        node.namedChildren().forEach { child -> visit(child, innerScope, definitions) }
    }

    private fun definitionStartedBy(node: SyntaxNode, owner: DeclarationBuilder): DeclarationBuilder? {
        val type = DEFINITION_TYPES[node.type] ?: return null
        val isObjectOfScript = owner.type == DeclarationType.SCRIPT && (node.type != ROUTINE_DECLARATION || isCreated(node))
        val isRoutineOfPackage = owner.isPackage && node.type == ROUTINE_DEFINITION
        if (!isObjectOfScript && !isRoutineOfPackage) return null
        val name = SqlNames.simpleNameOf(node)?.lowercase() ?: return null
        val parentPath = if (isRoutineOfPackage) listOf(owner.name) else emptyList()
        return DeclarationBuilder(name, type, parentPath, isPackage = node.type == PACKAGE_DEFINITION)
    }

    // ALTER PROCEDURE p COMPILE names a routine created elsewhere
    private fun isCreated(routine: SyntaxNode): Boolean = routine.getChild(0).type == CREATE_KEYWORD

    private fun record(node: SyntaxNode, scope: Scope) {
        when (node.type) {
            COMMON_TABLE_EXPRESSION -> SqlNames.simpleNameOf(node)?.let { scope.owner.addLocalName(it.lowercase()) }
            OBJECT_REFERENCE -> usedName(node)?.let { scope.owner.addUsedName(it) }
            // The type of a column or a parameter, VARCHAR(100), reads like a call
            INVOCATION -> if (!scope.holdsTypes) usedName(node)?.let { scope.owner.addUsedName(it) }
        }
    }

    private fun usedName(node: SyntaxNode): String? {
        val nameNode = SqlNames.nameNodeOf(node) ?: return null
        if (PREFIXES_OF_NO_OBJECT.any { nameNode.text.startsWith(it) }) return null
        return SqlNames.partsOf(nameNode).takeLast(USED_NAME_PARTS).joinToString(NAME_PART_SEPARATOR).lowercase()
    }

    private class DeclarationBuilder(
        val name: String,
        val type: DeclarationType,
        val parentPath: List<String> = emptyList(),
        val isPackage: Boolean = false
    ) {
        private val usedNames = linkedSetOf<String>()
        private val localNames = mutableSetOf<String>()

        fun addUsedName(usedName: String) {
            usedNames.add(usedName)
        }

        fun addLocalName(localName: String) {
            localNames.add(localName)
        }

        fun usesAnything(): Boolean = usedObjects().isNotEmpty()

        fun build(): Declaration = Declaration(name, type, usedObjects().map { UsedType(it) }.toSet(), parentPath)

        // A common table expression is used by its name, but it is no object of the database
        private fun usedObjects(): List<String> = usedNames.filter { it !in localNames }
    }
}
