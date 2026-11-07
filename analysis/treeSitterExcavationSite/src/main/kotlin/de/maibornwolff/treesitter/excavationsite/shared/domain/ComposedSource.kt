package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * A file in a format no grammar reads, such as the layout of an Access form, taken apart into the code it holds in
 * other languages ([codeParts]) and the [routines] it declares, such as the submacros of an Access macro. Its metrics
 * are the decisions of those parts, the [codeLines] and [commentLines] it counts itself, the [lines] of the file, and
 * the objects it [counts], such as the controls of a form; its texts are those of the parts and its own [texts], such
 * as the names and captions of the controls.
 */
data class ComposedSource(
    val codeParts: List<EmbeddedSource>,
    val codeLines: Int,
    val lines: Int,
    val counts: Map<AvailableFileMetrics, Int> = emptyMap(),
    val texts: List<ExtractedText> = emptyList(),
    val commentLines: Int = 0,
    val routines: List<ComposedRoutine> = emptyList()
) {
    val allParts: List<EmbeddedSource> get() = codeParts + routines.map { it.part }
}

/** A routine of a [ComposedSource]: its decisions are those of its [part], its [codeLines] the ones the file counts for it. */
data class ComposedRoutine(val part: EmbeddedSource, val codeLines: Int)
