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
     * Process source code through the pipeline, scoping the filter stage to the file's own path so
     * framework keywords apply only under the directories those frameworks were detected in.
     */
    fun process(sourceCode: String, filePath: Path): Map<String, Int> {
        if (sourceCode.isBlank()) {
            return emptyMap()
        }

        val extractedTexts = extractStage.extract(sourceCode)
        val weightedTexts = weightStage.weight(extractedTexts)
        val splitResults = splitStage.split(weightedTexts)
        val ngramTexts = ngramsStage.generateNgrams(splitResults)
        val filteredTexts = filterStage.filter(ngramTexts, filePath)

        return aggregateStage.aggregate(filteredTexts)
    }
}
