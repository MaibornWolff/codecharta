package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Holds language-specific dependency extraction functions.
 *
 * Each language provides its own instance with language-specific
 * extractors for package, import, and type extraction.
 * Functions are stored as data (lambdas), consistent with how
 * [Extract] stores custom extraction functions.
 *
 * @property embeddedSources the sources in another language inside a file that count for its dependencies only, in
 * place of the [LanguageDefinition.embeddedSources], see [EmbeddedSourceMapping]
 * @property grammarOfWholeFile set where metrics and text extraction parse only a part of the file with the grammar
 * of that part: dependency extraction then parses the whole, unprocessed file with this grammar instead
 * @property preprocessor turns the text dependency extraction parses, after the language's own preprocessor, into one
 * the grammar reads as the compiler does; it keeps every character's position, and the file itself stays unchanged
 */
data class LanguageDependencyMapping(
    val extractPackagePath: (SyntaxNode) -> List<String>,
    val extractImports: (SyntaxNode) -> List<ImportDeclaration>,
    val extractDeclarations: (SyntaxNode) -> List<Declaration>,
    val embeddedSources: EmbeddedSourceMapping? = null,
    val grammarOfWholeFile: GrammarLibrary? = null,
    val preprocessor: ((String) -> String)? = null
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
