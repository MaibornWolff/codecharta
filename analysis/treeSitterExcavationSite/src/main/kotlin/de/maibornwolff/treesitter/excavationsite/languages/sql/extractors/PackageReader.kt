package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlMember
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlMemberKind
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlName
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlObject
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlObjectKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The members of an Oracle package specification or body, or of an object type body: its routines, and the
 * constants, variables, types, cursors and exceptions the grammar leaves as tokens up to their semicolon. What a
 * package body runs when it is loaded (`BEGIN … END pricing;`) are the names of the package itself.
 */
internal object PackageReader {
    private const val ROUTINE_DEFINITION = "routine_definition"
    private const val ROUTINE_DECLARATION = "routine_declaration"
    private const val NAME_FIELD = "name"
    private const val OBJECT_NAME = "object_name"
    private const val SEPARATOR = ";"
    private const val BEGIN = "BEGIN"
    private const val END = "END"
    private val HEADER_ENDS = setOf("AS", "IS")
    private val SKIPPED_ITEMS = setOf("PRAGMA", END, "MEMBER", "STATIC", "CONSTRUCTOR", "MAP", "ORDER", "OVERRIDING", "FINAL")
    private val MODIFIERS = setOf("CONSTANT")
    private val KEYWORD_KINDS = mapOf("TYPE" to SqlMemberKind.TYPE, "SUBTYPE" to SqlMemberKind.TYPE, "CURSOR" to SqlMemberKind.CURSOR)

    fun read(node: SyntaxNode, kind: SqlObjectKind, name: List<String>, defaultSchema: String?): SqlObject {
        val inPackage = kind != SqlObjectKind.TYPE_BODY
        val members = mutableListOf<SqlMember>()
        val packageNames = mutableListOf<SqlName>()
        var item = mutableListOf<SyntaxNode>()
        var isLoadCode = false
        for (child in contentOf(node)) {
            when {
                isLoadCode -> item += child
                NameTokens.wordOf(child) == BEGIN -> {
                    isLoadCode = true
                    item = mutableListOf()
                }
                child.type == ROUTINE_DEFINITION || child.type == ROUTINE_DECLARATION -> {
                    memberOf(item, inPackage)?.let { members += it }
                    item = mutableListOf()
                    routineOf(child, inPackage)?.let { members += it }
                }
                child.type == SEPARATOR -> {
                    memberOf(item, inPackage)?.let { members += it }
                    item = mutableListOf()
                }
                else -> item += child
            }
        }
        if (isLoadCode) packageNames += SqlNameCollector(emptySet(), inPackage).namesOfTokens(item)
        return SqlObject(kind, name, defaultSchema, members, packageNames)
    }

    // What follows `CREATE PACKAGE pricing AS`
    private fun contentOf(node: SyntaxNode): List<SyntaxNode> {
        val children = node.children().toList()
        val nameEnd = node.getChildByFieldName(NAME_FIELD).endByte
        val headerEnd = children.indexOfFirst { it.startByte >= nameEnd && NameTokens.wordOf(it) in HEADER_ENDS }
        return children.drop(headerEnd + 1)
    }

    private fun routineOf(routine: SyntaxNode, inPackage: Boolean): SqlMember? {
        val name = SqlNames.nameNodeOf(routine)?.let { SqlNames.comparablePartsOf(it).lastOrNull() } ?: return null
        val names = SqlNameCollector(SqlLocals.of(routine, isTrigger = false), inPackage).namesOf(routine)
        return SqlMember(name, SqlMemberKind.ROUTINE, names)
    }

    private fun memberOf(item: List<SyntaxNode>, inPackage: Boolean): SqlMember? {
        val first = item.firstOrNull() ?: return null
        val firstWord = NameTokens.wordOf(first)
        if (firstWord in SKIPPED_ITEMS) return null
        val keywordKind = KEYWORD_KINDS[firstWord]
        val nameToken = (if (keywordKind != null) item.getOrNull(1) else first)?.takeIf { it.type == OBJECT_NAME } ?: return null
        val name = SqlNames.comparablePartsOf(nameToken).last()
        val rest = item.drop(item.indexOf(nameToken) + 1)
        val typeToken = if (keywordKind == null) rest.firstOrNull { NameTokens.wordOf(it) !in MODIFIERS } else null
        val names = SqlNameCollector(emptySet(), inPackage).namesOfTokens(rest, listOfNotNull(typeToken))
        return SqlMember(name, keywordKind ?: kindOfDeclaration(rest), names)
    }

    private fun kindOfDeclaration(rest: List<SyntaxNode>): SqlMemberKind {
        val words = rest.map { NameTokens.wordOf(it) }
        return when {
            words.firstOrNull() == "EXCEPTION" -> SqlMemberKind.EXCEPTION
            words.firstOrNull() in MODIFIERS -> SqlMemberKind.CONSTANT
            else -> SqlMemberKind.VARIABLE
        }
    }
}
