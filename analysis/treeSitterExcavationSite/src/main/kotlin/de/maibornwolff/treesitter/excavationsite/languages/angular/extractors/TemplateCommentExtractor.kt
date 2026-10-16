package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.QUOTED_ATTRIBUTE_VALUE
import de.maibornwolff.treesitter.excavationsite.languages.angular.STRING
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

// tree-sitter-angular 0.9.2 lexes `<!-- -->` inside an attribute value or a string literal as a comment too
internal val QUOTING_PARENTS = setOf(QUOTED_ATTRIBUTE_VALUE, STRING)

internal fun extractTemplateComment(node: SyntaxNode): String? =
    if (node.parent.type in QUOTING_PARENTS) null else CommentParser.stripHtmlComment(node.text)
