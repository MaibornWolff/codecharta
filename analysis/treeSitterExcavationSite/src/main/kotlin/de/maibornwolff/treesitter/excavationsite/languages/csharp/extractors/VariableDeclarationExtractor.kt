package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val VARIABLE_DECLARATION = "variable_declaration"

/**
 * Extracts identifier from field_declaration, local_declaration_statement,
 * or event_field_declaration.
 *
 * Finds identifier inside variable_declaration -> variable_declarator.
 */
internal fun findIdentifierInVariableDeclaration(node: TSNode, sourceCode: String): String? = node
    .children()
    .firstOrNull { it.type == VARIABLE_DECLARATION }
    ?.let { findIdentifierInVariableDeclarator(it, sourceCode) }
