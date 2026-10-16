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
 * are compared the way [SqlNames.comparablePartsOf] writes them and keep at most their last two parts, the schema or
 * package and the object. A created object has its schema as parent, a routine inside a package the
 * package. A definition inside a routine (a temporary table, say) is part of the routine.
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
    private const val ANCHORED_TYPE = "anchored_type"
    private const val ANCHOR_FIELD = "anchor"
    private const val ROW_TYPE_ANCHOR = "%rowtype"
    private val TYPE_HOLDERS = setOf("column_definition", "parameter")
    private val DEFINITION_TYPES = mapOf(
        "table_definition" to DeclarationType.CLASS,
        "view_definition" to DeclarationType.CLASS,
        "synonym_definition" to DeclarationType.CLASS,
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
        val nameParts =
            SqlNames.nameNodeOf(node)?.let { SqlNames.comparablePartsOf(it) }?.takeIf { it.isNotEmpty() } ?: return null
        val parentPath = if (isRoutineOfPackage) listOf(owner.name) else schemaOf(nameParts)
        return DeclarationBuilder(nameParts.last(), type, parentPath, isPackage = node.type == PACKAGE_DEFINITION)
    }

    // The schema of dbo.orders, or nothing for an unqualified name
    private fun schemaOf(nameParts: List<String>): List<String> = nameParts.dropLast(1).takeLast(1)

    // ALTER PROCEDURE p COMPILE names a routine created elsewhere
    private fun isCreated(routine: SyntaxNode): Boolean = routine.getChild(0).type == CREATE_KEYWORD

    private fun record(node: SyntaxNode, scope: Scope) {
        when (node.type) {
            COMMON_TABLE_EXPRESSION -> SqlNames.nameNodeOf(node)?.let { scope.owner.addLocalName(SqlNames.comparablePartsOf(it).last()) }
            OBJECT_REFERENCE -> usedName(node)?.let { scope.owner.addUsedName(it) }
            ANCHORED_TYPE -> anchoredTable(node)?.let { scope.owner.addUsedName(it) }
            // The type of a column or a parameter, VARCHAR(100), reads like a call
            INVOCATION -> if (!scope.holdsTypes) usedName(node)?.let { scope.owner.addUsedName(it) }
        }
    }

    private fun usedName(node: SyntaxNode): String? {
        val nameNode = SqlNames.nameNodeOf(node) ?: return null
        return usedNameOf(nameNode, SqlNames.comparablePartsOf(nameNode))
    }

    // orders%ROWTYPE is the type of the table orders, orders.total%TYPE that of its column; v_total%TYPE names no table
    private fun anchoredTable(node: SyntaxNode): String? {
        val nameNode = SqlNames.nameNodeOf(node) ?: return null
        val parts = SqlNames.comparablePartsOf(nameNode)
        val isRowType = node.getChildByFieldName(ANCHOR_FIELD).text.lowercase() == ROW_TYPE_ANCHOR
        return usedNameOf(nameNode, if (isRowType) parts else parts.dropLast(1))
    }

    private fun usedNameOf(nameNode: SyntaxNode, nameParts: List<String>): String? {
        if (nameParts.isEmpty() || PREFIXES_OF_NO_OBJECT.any { nameNode.text.startsWith(it) }) return null
        return nameParts.takeLast(USED_NAME_PARTS).joinToString(NAME_PART_SEPARATOR)
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
