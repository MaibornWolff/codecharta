package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Holds language-specific dependency extraction functions.
 *
 * Each language provides its own instance with language-specific
 * extractors for package, import, and type extraction.
 * Functions are stored as data (lambdas), consistent with how
 * [Extract] stores custom extraction functions.
 */
data class LanguageDependencyMapping(
    val extractPackagePath: (SyntaxNode) -> List<String>,
    val extractImports: (SyntaxNode) -> List<ImportDeclaration>,
    val extractDeclarations: (SyntaxNode) -> List<Declaration>
)

/**
 * Interface for language-specific dependency mapping definitions.
 *
 * Languages that support dependency mapping provide a [LanguageDependencyMapping].
 * Languages without dependency support use the default (null).
 */
interface DependencyMapping {
    val dependencyMapping: LanguageDependencyMapping?
        get() = null

    val isDependencyMappingSupported: Boolean
        get() = dependencyMapping != null
}
