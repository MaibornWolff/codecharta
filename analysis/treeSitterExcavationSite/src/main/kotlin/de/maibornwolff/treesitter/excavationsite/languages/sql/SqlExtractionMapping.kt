package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.extractSqlComment
import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.extractSqlDollarString
import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.extractSqlName
import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.extractSqlString
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping

/**
 * SQL extraction definitions: the names a script gives (objects, columns, parameters, variables, common table
 * expressions) and the names of the objects it uses, each without schema and quotes.
 */
object SqlExtractionMapping : ExtractionMapping {
    private val NAMED_NODES = listOf(
        "routine_definition",
        "routine_declaration",
        "package_definition",
        "view_definition",
        "table_definition",
        "column_definition",
        "parameter",
        "variable_declaration",
        "common_table_expression",
        "object_reference"
    )

    override val nodeExtractions: Map<String, Extract> = buildMap {
        NAMED_NODES.forEach { nodeType -> put(nodeType, Extract.Identifier(customSingle = ::extractSqlName)) }

        put("comment", Extract.Comment(custom = ::extractSqlComment))

        put("string", Extract.StringLiteral(custom = ::extractSqlString))
        put("dollar_string", Extract.StringLiteral(custom = ::extractSqlDollarString))
    }
}
