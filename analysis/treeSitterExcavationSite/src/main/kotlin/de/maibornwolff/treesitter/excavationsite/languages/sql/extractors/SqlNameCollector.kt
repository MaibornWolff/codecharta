package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlName
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlNameKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a definition or statement writes, each with the kind of object its position asks for (`sql.md`, kinds),
 * without those its [locals] hide. Inside a package ([inPackage]) a plain identifier may be a member of the package.
 */
internal class SqlNameCollector(private val locals: Set<String>, private val inPackage: Boolean) {
    private val names = linkedSetOf<SqlName>()
    private val typePositions = HashSet<Pair<Int, Int>>()

    /** The names below [node], without the name it gives itself. */
    fun namesOf(node: SyntaxNode): List<SqlName> {
        visitChildren(node, node.children().toList())
        return names.toList()
    }

    /** The names of a statement the grammar leaves as tokens; [typeTokens] stand where a type is written. */
    fun namesOfTokens(tokens: List<SyntaxNode>, typeTokens: List<SyntaxNode> = emptyList()): List<SqlName> {
        typeTokens.forEach { typePositions += positionOf(it) }
        visitChildren(null, tokens)
        return names.toList()
    }

    private fun visitChildren(parent: SyntaxNode?, children: List<SyntaxNode>) {
        val ownName = parent?.getChildByFieldName(NAME_FIELD)?.orNull()?.let { positionOf(it) }
        var index = 0
        while (index < children.size) {
            val child = children[index]
            val sequence = nextValueFor(children, index)
            if (sequence != null) {
                record(sequence.first, SqlNameKind.SEQUENCE)
                index = sequence.second
                continue
            }
            if (positionOf(child) != ownName) visitChild(parent, children, index)
            index++
        }
    }

    private fun visitChild(parent: SyntaxNode?, children: List<SyntaxNode>, index: Int) =
        visit(children[index], children.getOrNull(index - 1), children.getOrNull(index + 1), isTypeAfter(parent, children, index))

    private fun visit(node: SyntaxNode, previous: SyntaxNode?, next: SyntaxNode?, isTypePosition: Boolean) {
        when (node.type) {
            OBJECT_REFERENCE -> referenceOf(node, previous, next)
            INVOCATION -> invocationOf(node, isTypePosition)
            ANCHORED_TYPE -> anchoredTableOf(node)?.let { record(it, SqlNameKind.RELATION) }
            OBJECT_NAME -> plainNameOf(node, isTypePosition || previous?.text == CAST_OPERATOR || positionOf(node) in typePositions)
            ROUTINE_BODY -> {
                markDeclareSectionTypes(node)
                visitChildren(node, node.children().toList())
            }
            else -> visitChildren(node, node.children().toList())
        }
    }

    // EXEC p, PERFORM p(), and a table function in FROM recent_orders(7), which the grammar reads as references
    private fun referenceOf(node: SyntaxNode, previous: SyntaxNode?, next: SyntaxNode?) {
        val parts = partsOf(node) ?: return
        val previousWord = previous?.let { NameTokens.wordOf(it) }
        val isTableFunction = previousWord in RELATION_KEYWORDS && next?.type == OPENING_PARENTHESIS
        record(parts, if (previousWord in CALL_KEYWORDS || isTableFunction) SqlNameKind.ROUTINE else SqlNameKind.RELATION)
    }

    private fun invocationOf(node: SyntaxNode, isTypePosition: Boolean) {
        val parts = partsOf(node)
        if (parts != null) {
            sequenceInStringOf(node, parts)?.let { record(it, SqlNameKind.SEQUENCE) }
            record(parts, if (isTypePosition) SqlNameKind.TYPE else SqlNameKind.ROUTINE)
        }
        visitChildren(node, node.children().toList())
    }

    // nextval('order_seq'): PostgreSQL resolves the string as a sequence name when the statement is created
    private fun sequenceInStringOf(node: SyntaxNode, parts: List<String>): List<String>? {
        if (parts.last() !in SEQUENCE_FUNCTIONS) return null
        val argument = node.namedChildren().firstOrNull { it.type == STRING }?.text ?: return null
        return argument.removeSurrounding(QUOTE).split(PART_SEPARATOR).map { SqlNames.comparablePartOf(it) }.takeLast(USED_NAME_PARTS)
    }

    // orders%ROWTYPE is the type of the table orders, orders.total%TYPE that of its column; v_total%TYPE names no table
    private fun anchoredTableOf(node: SyntaxNode): List<String>? {
        val nameNode = SqlNames.nameNodeOf(node) ?: return null
        val parts = SqlNames.comparablePartsOf(nameNode)
        val isRowType = node.getChildByFieldName(ANCHOR_FIELD).text.lowercase() == ROW_TYPE_ANCHOR
        return usedParts(nameNode, if (isRowType) parts else parts.dropLast(1))
    }

    private fun plainNameOf(node: SyntaxNode, isTypePosition: Boolean) {
        val parts = usedParts(node, SqlNames.comparablePartsOf(node)) ?: return
        when {
            isTypePosition -> record(parts, SqlNameKind.TYPE)
            parts.size > 1 && parts.last() in SEQUENCE_PSEUDO_COLUMNS -> record(parts.dropLast(1), SqlNameKind.SEQUENCE)
            parts.size > 1 -> record(parts, SqlNameKind.MEMBER)
            inPackage -> record(parts, SqlNameKind.BARE)
        }
    }

    // NEXT VALUE FOR dbo.order_seq, which the grammar leaves as tokens
    private fun nextValueFor(children: List<SyntaxNode>, index: Int): Pair<List<String>, Int>? {
        val words = (index until minOf(index + NEXT_VALUE_FOR.size, children.size)).map { NameTokens.wordOf(children[it]) }
        if (words != NEXT_VALUE_FOR) return null
        return NameTokens.nameAt(children, index + NEXT_VALUE_FOR.size)
    }

    // The type of a column or parameter follows its name; that of a routine its RETURNS, or RETURN in PL/SQL
    private fun isTypeAfter(parent: SyntaxNode?, children: List<SyntaxNode>, index: Int): Boolean {
        val child = children[index]
        if (child.type != OBJECT_NAME && child.type != INVOCATION) return false
        val previous = children.getOrNull(index - 1) ?: return false
        return when (parent?.type) {
            in TYPE_HOLDERS ->
                previous.type == IDENTIFIER &&
                    positionOf(previous) == parent?.getChildByFieldName(NAME_FIELD)?.let { positionOf(it) }
            in ROUTINE_HEADERS -> NameTokens.wordOf(previous) in RETURN_KEYWORDS
            else -> previous.type == VARIABLE_DECLARATION
        }
    }

    private fun markDeclareSectionTypes(body: SyntaxNode) {
        SqlLocals.DeclareSection.items(body).forEach { item ->
            val name = SqlLocals.DeclareSection.nameTokenOf(item) ?: return@forEach
            if (name != item.first()) return@forEach
            item.drop(1).firstOrNull { NameTokens.wordOf(it) !in DECLARATION_MODIFIERS }?.let { typePositions += positionOf(it) }
        }
    }

    private fun partsOf(node: SyntaxNode): List<String>? {
        val nameNode = SqlNames.nameNodeOf(node) ?: return null
        return usedParts(nameNode, SqlNames.comparablePartsOf(nameNode))
    }

    private fun usedParts(nameNode: SyntaxNode, parts: List<String>): List<String>? {
        if (parts.isEmpty() || PREFIXES_OF_NO_OBJECT.any { nameNode.text.startsWith(it) }) return null
        return parts.takeLast(USED_NAME_PARTS)
    }

    private fun record(parts: List<String>, kind: SqlNameKind) {
        if (parts.size == 1 && parts.single() in locals) return
        names += SqlName(parts, kind)
    }

    private fun positionOf(node: SyntaxNode): Pair<Int, Int> = node.startByte to node.endByte

    companion object {
        private const val NAME_FIELD = "name"
        private const val ANCHOR_FIELD = "anchor"
        private const val OBJECT_REFERENCE = "object_reference"
        private const val OBJECT_NAME = "object_name"
        private const val INVOCATION = "invocation"
        private const val ANCHORED_TYPE = "anchored_type"
        private const val ROUTINE_BODY = "routine_body"
        private const val VARIABLE_DECLARATION = "variable_declaration"
        private const val IDENTIFIER = "identifier"
        private const val STRING = "string"
        private const val QUOTE = "'"
        private const val PART_SEPARATOR = "."
        private const val CAST_OPERATOR = "::"
        private const val ROW_TYPE_ANCHOR = "%rowtype"

        // A schema and an object, or a package and its member; a database in front of them names no object
        private const val USED_NAME_PARTS = 3
        private val TYPE_HOLDERS = setOf("column_definition", "parameter")
        private val ROUTINE_HEADERS = setOf("routine_definition", "routine_declaration")
        private val RETURN_KEYWORDS = setOf("RETURNS", "RETURN")
        private val CALL_KEYWORDS = setOf("EXEC", "EXECUTE", "CALL", "PERFORM")
        private val RELATION_KEYWORDS = setOf("FROM", "JOIN")
        private const val OPENING_PARENTHESIS = "("
        private val DECLARATION_MODIFIERS = setOf("CONSTANT")
        private val NEXT_VALUE_FOR = listOf("NEXT", "VALUE", "FOR")
        private val SEQUENCE_FUNCTIONS = setOf("nextval", "currval", "setval")
        private val SEQUENCE_PSEUDO_COLUMNS = setOf("nextval", "currval")

        // Variables, temporary tables and template placeholders name no object of the database
        private val PREFIXES_OF_NO_OBJECT = listOf("@", ":", "#", "{{")
    }
}
