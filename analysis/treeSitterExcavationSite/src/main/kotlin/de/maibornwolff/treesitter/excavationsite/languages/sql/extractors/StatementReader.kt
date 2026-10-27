package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlObject
import de.maibornwolff.treesitter.excavationsite.languages.sql.model.SqlObjectKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The statements the grammar leaves as tokens that create an object (`CREATE SEQUENCE`, `CREATE TYPE`, `CREATE
 * DOMAIN`), change one (`ALTER TABLE`, `CREATE INDEX … ON`, `COMMENT ON`, decision 2 of `sql.md`) or set the default
 * schema (`SET search_path`, `SET SCHEMA`, `ALTER SESSION SET CURRENT_SCHEMA`, decision 4).
 */
internal object StatementReader {
    private const val INVOCATION = "invocation"
    private const val STRING = "string"
    private const val QUOTE = "'"
    private const val CURRENT_USER_SCHEMA = "\$user"
    private val VALUE_MARKERS = setOf("TO")
    private val SCHEMA_TOKENS = setOf("object_name", "identifier", "quoted_identifier", STRING)
    private val CREATED_KINDS = listOf(
        "SEQUENCE" to SqlObjectKind.SEQUENCE,
        "TYPE" to SqlObjectKind.TYPE,
        "DOMAIN" to SqlObjectKind.DOMAIN
    )
    private val ALTERED_KINDS = listOf(
        listOf("TABLE") to null,
        listOf("VIEW") to null,
        listOf("MATERIALIZED", "VIEW") to null,
        listOf("SEQUENCE") to SqlObjectKind.SEQUENCE,
        listOf("TYPE") to SqlObjectKind.TYPE
    )
    private val COMMENTED_KINDS = listOf(listOf("TABLE"), listOf("VIEW"), listOf("MATERIALIZED", "VIEW"))
    private val COMMENTED_COLUMN = listOf("COLUMN")

    /** The schema the statement makes the default one, or null if it sets none. */
    fun schemaSetBy(tokens: List<SyntaxNode>): String? {
        val valueStart = when {
            NameTokens.startsWith(tokens, "SET", "SEARCH_PATH") -> 2
            NameTokens.startsWith(tokens, "SET", "SCHEMA") -> 2
            NameTokens.startsWith(tokens, "ALTER", "SESSION", "SET", "CURRENT_SCHEMA") -> 4
            else -> return null
        }
        return tokens
            .drop(valueStart)
            .filter { it.type in SCHEMA_TOKENS && NameTokens.wordOf(it) !in VALUE_MARKERS }
            .map { schemaNameOf(it) }
            .firstOrNull { it != CURRENT_USER_SCHEMA }
    }

    /** The object the statement creates or changes, or null for any other statement. */
    fun objectOf(tokens: List<SyntaxNode>, defaultSchema: String?): SqlObject? = when {
        NameTokens.startsWith(tokens, "CREATE") -> createdOrIndexed(tokens, defaultSchema)
        NameTokens.startsWith(tokens, "ALTER") -> altered(tokens, defaultSchema)
        NameTokens.startsWith(tokens, "COMMENT", "ON") -> commented(tokens, defaultSchema)
        else -> null
    }

    private fun createdOrIndexed(tokens: List<SyntaxNode>, defaultSchema: String?): SqlObject? {
        val indexAt = NameTokens.indexOfWord(tokens, "INDEX")
        if (indexAt in 1..3) return indexed(tokens, indexAt, defaultSchema)
        val (keyword, kind) = CREATED_KINDS.firstOrNull { (keyword, _) -> NameTokens.indexOfWord(tokens, keyword) in 1..3 } ?: return null
        val (name, _) = NameTokens.nameAt(tokens, NameTokens.indexOfWord(tokens, keyword) + 1) ?: return null
        return SqlObject(kind, name, defaultSchema)
    }

    // CREATE INDEX ix ON orders (customer_id): the grammar reads `orders (customer_id)` as a call
    private fun indexed(tokens: List<SyntaxNode>, indexAt: Int, defaultSchema: String?): SqlObject? {
        val onAt = NameTokens.indexOfWord(tokens, "ON", indexAt)
        val target = tokens.getOrNull(onAt + 1) ?: return null
        val name = if (target.type == INVOCATION) {
            SqlNames.nameNodeOf(target)?.let { SqlNames.comparablePartsOf(it).takeLast(2) }
        } else {
            NameTokens.nameAt(tokens, onAt + 1)?.first
        } ?: return null
        val rest = tokens.drop(onAt + 2)
        return SqlObject(
            SqlObjectKind.CHANGE,
            name,
            defaultSchema,
            names = SqlNameCollector(emptySet(), inPackage = false).namesOfTokens(rest)
        )
    }

    private fun altered(tokens: List<SyntaxNode>, defaultSchema: String?): SqlObject? {
        val words = tokens.map { NameTokens.wordOf(it) }
        val written = words.drop(1)
        val (keywords, changedKind) = ALTERED_KINDS.firstOrNull { (keywords, _) -> written.take(keywords.size) == keywords } ?: return null
        val (name, end) = NameTokens.nameAt(tokens, 1 + keywords.size) ?: return null
        val names = SqlNameCollector(emptySet(), inPackage = false).namesOfTokens(tokens.drop(end))
        return SqlObject(SqlObjectKind.CHANGE, name, defaultSchema, names = names, changedKind = changedKind)
    }

    // COMMENT ON COLUMN orders.total IS '…' changes the table orders
    private fun commented(tokens: List<SyntaxNode>, defaultSchema: String?): SqlObject? {
        val words = tokens.map { NameTokens.wordOf(it) }.drop(2)
        val keywords = (COMMENTED_KINDS + listOf(COMMENTED_COLUMN)).firstOrNull { words.take(it.size) == it } ?: return null
        val (name, _) = NameTokens.nameAt(tokens, 2 + keywords.size) ?: return null
        val table = if (keywords == COMMENTED_COLUMN) name.dropLast(1) else name
        return table.takeIf { it.isNotEmpty() }?.let { SqlObject(SqlObjectKind.CHANGE, it, defaultSchema) }
    }

    private fun schemaNameOf(token: SyntaxNode): String {
        if (token.type == STRING) return SqlNames.comparablePartOf(token.text.removeSurrounding(QUOTE))
        return NameTokens.nameAt(listOf(token), 0)?.first?.last() ?: SqlNames.comparablePartOf(token.text)
    }
}
