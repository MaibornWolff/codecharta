package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Rust has no in-content package declaration: a file's module path from the crate
 * root (`src/foo/bar.rs` → `crate::foo::bar`) is filesystem-derived and not visible
 * in the source text. Deriving it requires the physical file path, which TSE never
 * sees, so package-path derivation is DependaCharta's job.
 *
 * The in-file inline-`mod` chain is carried per declaration via [Declaration.parentPath]
 * instead (see [DeclarationExtractor]). This extractor therefore always returns empty,
 * ignoring the root node.
 */
internal object PackageExtractor {
    val extract: (SyntaxNode) -> List<String> = { emptyList() }
}
