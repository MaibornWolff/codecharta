package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val STRING_CONTENT = "string_content"
private const val ESCAPE_SEQUENCE = "escape_sequence"

/**
 * Extracts the inner text of a Rust `string_literal` by concatenating its
 * `string_content` and `escape_sequence` children in order.
 *
 * This covers three cases a single declarative strategy cannot:
 * - escape sequences, which the grammar splits into separate `string_content`
 *   and `escape_sequence` siblings (a `FromChild` strategy would return only the
 *   first chunk);
 * - byte strings (`b"…"`), whose `b` prefix is part of the opening-quote token and
 *   is therefore naturally excluded;
 * - empty literals, which have no content children and yield "".
 */
internal fun extractRustStringLiteralContent(node: TSNode, sourceCode: String): String = node
    .children()
    .filter { it.type == STRING_CONTENT || it.type == ESCAPE_SEQUENCE }
    .joinToString("") { TreeTraversal.getNodeText(it, sourceCode) }
