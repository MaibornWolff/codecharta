package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * A file in a format no grammar reads, such as the layout of an Access form, taken apart into the code it holds in
 * other languages ([codeParts]). Its metrics are the decisions of those parts, the [codeLines] they take up in the
 * file, the [lines] of the file, and the objects it [counts], such as the controls of a form; its texts are those of
 * the parts and its own [texts], such as the names and captions of the controls.
 */
data class ComposedSource(
    val codeParts: List<EmbeddedSource>,
    val codeLines: Int,
    val lines: Int,
    val counts: Map<AvailableFileMetrics, Int> = emptyMap(),
    val texts: List<ExtractedText> = emptyList()
)
