package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Language
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.StopWordFilter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages.AggregateStage
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages.ExtractStage
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages.FilterStage
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages.NgramsStage
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages.SplitStage
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages.WeightStage
import java.nio.file.Path

/**
 * Source code analysis pipeline using tree-sitter.
 *
 * This pipeline implements a sequential architecture:
 * 1. Extract: Extract identifiers, comments, and strings using TreeSitterLibrary
 * 2. Weight: Apply weights based on extraction context
 * 3. Split: Split identifiers/text into individual words
 * 4. N-grams: Generate n-grams from identifier words
 * 5. Filter: Remove stop words (with optional path-scoped framework filtering)
 * 6. Aggregate: Sum weights to produce frequency map
 */
class SourceCodePipeline(
    language: Language,
    weights: ExtractionWeights = ExtractionWeights(),
    ngrams: Int = 1,
    private val stopWordFilter: StopWordFilter,
    enableSsr: Boolean = true
) {
    private val extractStage = ExtractStage(language.libraryLanguage)
    private val weightStage = WeightStage(weights)
    private val splitStage = SplitStage(ngrams)
    private val ngramsStage = NgramsStage(ngrams, enableSsr)
    private val filterStage = FilterStage(stopWordFilter)
    private val aggregateStage = AggregateStage()

    /**
     * Process source code through the pipeline.
     *
     * @param sourceCode The source code to analyze
     * @return Map of word to frequency count
     */
    fun process(sourceCode: String): Map<String, Int> = processWithOptionalPath(sourceCode, filePath = null)

    /**
     * Process source code through the pipeline with path-scoped framework filtering.
     *
     * @param sourceCode The source code to analyze
     * @param filePath The path of the file being processed (used for path-scoped filtering)
     * @return Map of word to frequency count
     */
    fun process(sourceCode: String, filePath: Path): Map<String, Int> = processWithOptionalPath(sourceCode, filePath)

    private fun processWithOptionalPath(sourceCode: String, filePath: Path?): Map<String, Int> {
        if (sourceCode.isBlank()) {
            return emptyMap()
        }

        // Stage 1: Extract
        val extractedTexts = extractStage.extract(sourceCode)

        // Stage 2: Weight
        val weightedTexts = weightStage.weight(extractedTexts)

        // Stage 3: Split
        val splitResults = splitStage.split(weightedTexts)

        // Stage 4: N-grams
        val ngramTexts = ngramsStage.generateNgrams(splitResults)

        // Stage 5: Filter (with optional path-scoped framework filtering)
        val filteredTexts =
            if (filePath != null) {
                filterStage.filter(ngramTexts, filePath)
            } else {
                filterStage.filter(ngramTexts)
            }

        // Stage 6: Aggregate
        return aggregateStage.aggregate(filteredTexts)
    }
}
