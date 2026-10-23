package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Source in another language inside a file, such as a script block of a Vue component or the inline template of an
 * Angular component. The imports of every source become imports of the file, as a compiler hoists them; what a source
 * that belongs to the file declares becomes declarations of the file, after its own, what a source that belongs to a
 * declaration declares becomes [DependencyResult.embedded].
 *
 * @property owner the name of the declaration the source belongs to, null for a source that belongs to the file
 */
data class EmbeddedSource(val content: String, val language: Language, val owner: String? = null)

/**
 * Finds the sources in another language inside a file. Only a file that contains [marker] is parsed for them, which
 * spares the files without any a second parse. A language registers it once as [LanguageDefinition.embeddedSources],
 * which metrics, text extraction and dependencies read, or, where its preprocessor hands the sources to metrics and text
 * extraction already, as [LanguageDependencyMapping.embeddedSources], which dependencies read instead.
 */
data class EmbeddedSourceMapping(val marker: String, val extract: (SyntaxNode) -> List<EmbeddedSource>)
