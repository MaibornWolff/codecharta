package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlNameKind
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlObject
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlObjectKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The objects the grammar names a definition for: tables, views, synonyms, routines, triggers, and packages and object
 * type bodies, whose members [PackageReader] reads. A routine heading not created here (`ALTER PROCEDURE p COMPILE`)
 * is no definition.
 */
internal object DefinitionReader {
    private const val ROUTINE_DEFINITION = "routine_definition"
    private const val ROUTINE_DECLARATION = "routine_declaration"
    private const val PACKAGE_DEFINITION = "package_definition"
    private const val CREATE_KEYWORD = "CREATE"
    private const val TRIGGER_KEYWORD = "TRIGGER"
    private const val BODY_KEYWORD = "BODY"
    private const val TYPE_KEYWORD = "TYPE"
    private const val NAME_PARTS_KEPT = 2
    private const val NAME_FIELD = "name"
    private val KINDS = mapOf(
        "table_definition" to SqlObjectKind.TABLE,
        "view_definition" to SqlObjectKind.VIEW,
        "synonym_definition" to SqlObjectKind.SYNONYM
    )

    fun isDefinition(node: SyntaxNode): Boolean = node.type in KINDS ||
        node.type == ROUTINE_DEFINITION ||
        node.type == PACKAGE_DEFINITION ||
        (node.type == ROUTINE_DECLARATION && node.getChild(0).type == CREATE_KEYWORD)

    fun read(node: SyntaxNode, defaultSchema: String?): SqlObject? {
        val name = SqlNames.nameNodeOf(node)?.let { SqlNames.comparablePartsOf(it).takeLast(NAME_PARTS_KEPT) }?.takeIf { it.isNotEmpty() }
            ?: return null
        val kind = kindOf(node)
        if (node.type == PACKAGE_DEFINITION) return PackageReader.read(node, kind, name, defaultSchema)
        val locals = SqlLocals.of(node, isTrigger = kind == SqlObjectKind.TRIGGER)
        val names = SqlNameCollector(locals, inPackage = false).namesOf(node)
        val namesAsAsked = if (kind == SqlObjectKind.SYNONYM) names.map { it.copy(kind = SqlNameKind.ANY) } else names
        return SqlObject(kind, name, defaultSchema, names = namesAsAsked)
    }

    // CREATE TRIGGER t, not CREATE FUNCTION f() RETURNS TRIGGER
    private fun isTrigger(routine: SyntaxNode): Boolean {
        val nameStart = routine.getChildByFieldName(NAME_FIELD).startByte
        return routine.children().takeWhile { it.startByte < nameStart }.any { it.type == TRIGGER_KEYWORD }
    }

    private fun kindOf(node: SyntaxNode): SqlObjectKind {
        KINDS[node.type]?.let { return it }
        val keywords = node.children().map { it.type }.toSet()
        return when {
            node.type != PACKAGE_DEFINITION -> if (isTrigger(node)) SqlObjectKind.TRIGGER else SqlObjectKind.ROUTINE
            BODY_KEYWORD !in keywords -> SqlObjectKind.PACKAGE
            TYPE_KEYWORD in keywords -> SqlObjectKind.TYPE_BODY
            else -> SqlObjectKind.PACKAGE_BODY
        }
    }
}
