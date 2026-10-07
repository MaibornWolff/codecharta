package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Custom Delphi comment extractor.
 *
 * Pascal/Delphi supports three comment styles — tree-sitter-pascal emits a single
 * `comment` node type for all of them:
 *   - `// line comment`
 *   - `{ brace comment }`
 *   - `(* star comment *)`
 *
 * `CommentFormats.AutoDetect` does not recognize the `{}` and `(**)` styles,
 * so we strip the markers here.
 */
internal fun extractDelphiComment(node: SyntaxNode): String? {
    val text = node.text
    return when {
        text.startsWith("//") -> text.removePrefix("//").trim()
        text.startsWith("{") && text.endsWith("}") -> text.removePrefix("{").removeSuffix("}").trim()
        text.startsWith("(*") && text.endsWith("*)") -> text.removePrefix("(*").removeSuffix("*)").trim()
        else -> text.trim()
    }
}
