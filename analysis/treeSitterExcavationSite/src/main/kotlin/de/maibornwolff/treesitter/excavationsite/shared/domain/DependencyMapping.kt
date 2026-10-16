package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Holds language-specific dependency extraction functions.
 *
 * Each language provides its own instance with language-specific
 * extractors for package, import, and type extraction.
 * Functions are stored as data (lambdas), consistent with how
 * [Extract] stores custom extraction functions.
 *
 * @property embeddedSources the sources in another language inside a file, see [EmbeddedSource]: the same mapping as
 * the [LanguageDefinition.embeddedSources] of a language, or one of its own where the metrics and the text extraction
 * of the language read these sources through its [LanguageDefinition.preprocessor] already
 * @property grammarOfWholeFile set where metrics and text extraction parse only a part of the file with the grammar
 * of that part: dependency extraction then parses the whole, unprocessed file with this grammar instead
 */
data class LanguageDependencyMapping(
    val extractPackagePath: (SyntaxNode) -> List<String>,
    val extractImports: (SyntaxNode) -> List<ImportDeclaration>,
    val extractDeclarations: (SyntaxNode) -> List<Declaration>,
    val embeddedSources: EmbeddedSourceMapping? = null,
    val grammarOfWholeFile: GrammarLibrary? = null
)

/**
 * Source in another language inside a file, such as a script block of a Vue component or the inline template of an
 * Angular component. The imports of a source that belongs to the file become imports of the file; what it declares
 * does not become a declaration of the file. What a source that belongs to a declaration declares becomes the
 * [Declaration.embedded] of that declaration.
 *
 * @property owner the name of the declaration the source belongs to, null for a source that belongs to the file
 */
data class EmbeddedSource(val content: String, val language: Language, val owner: String? = null)

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
