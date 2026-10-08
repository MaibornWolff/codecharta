package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Holds language-specific dependency extraction functions.
 *
 * Each language provides its own instance with language-specific
 * extractors for package, import, and type extraction.
 * Functions are stored as data (lambdas), consistent with how
 * [Extract] stores custom extraction functions.
 *
 * @property grammarOfWholeFile set where metrics and text extraction parse only a part of the file with the grammar
 * of that part: dependency extraction then parses the whole, unprocessed file with this grammar instead
 */
data class LanguageDependencyMapping(
    val extractPackagePath: (SyntaxNode) -> List<String>,
    val extractImports: (SyntaxNode) -> List<ImportDeclaration>,
    val extractDeclarations: (SyntaxNode) -> List<Declaration>,
    val extractEmbeddedSources: (SyntaxNode) -> List<EmbeddedSource> = { emptyList() },
    val grammarOfWholeFile: GrammarLibrary? = null
)

/**
 * Source in another language inside a file, such as a script block of a Vue component. Its imports become imports
 * of the file; what it declares does not become a declaration of the file.
 */
data class EmbeddedSource(val content: String, val language: Language)

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
