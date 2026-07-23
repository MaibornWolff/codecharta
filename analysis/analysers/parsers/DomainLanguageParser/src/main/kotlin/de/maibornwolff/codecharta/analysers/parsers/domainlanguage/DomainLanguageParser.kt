package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.CommonAnalyserParameters
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.AnalysisConfiguration
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.ConfigurationBuilder
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.ParsedArguments
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.SortBy
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.StopWordLevel
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.DomainProjectGenerator
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.Language
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress.ProgressReporterFactory
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream

@CommandLine.Command(
    name = DomainLanguageParser.NAME,
    description = [DomainLanguageParser.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class DomainLanguageParser(private val input: InputStream = System.`in`, private val output: PrintStream = System.out) :
    CommonAnalyserParameters(),
    AnalyserInterface {
    @CommandLine.Option(names = ["--limit"], description = ["limit each node to its top X words (all words if not set)"])
    private var limit: Int? = null

    @CommandLine.Option(names = ["--ngrams"], description = ["generate n-grams up to size N (1=words, 2=bigrams, 3=trigrams)"])
    private var ngrams: Int = DEFAULT_NGRAMS

    @CommandLine.Option(
        names = ["--stop-word-level"],
        description = ["technical stop word filtering level: \${COMPLETION-CANDIDATES} (default: MODERATE)"]
    )
    private var stopWordLevel: StopWordLevel = StopWordLevel.MODERATE

    @CommandLine.Option(names = ["--identifier-weight"], description = ["weight for identifier words (class/function/variable names)"])
    private var identifierWeight: Int = DEFAULT_IDENTIFIER_WEIGHT

    @CommandLine.Option(names = ["--comment-weight"], description = ["weight for words in comments"])
    private var commentWeight: Int = DEFAULT_COMMENT_WEIGHT

    @CommandLine.Option(names = ["--string-weight"], description = ["weight for words in string literals"])
    private var stringWeight: Int = DEFAULT_STRING_WEIGHT

    @CommandLine.Option(
        names = ["--exclude-tests"],
        description = ["exclude test files from analysis (test files are included by default)"]
    )
    private var excludeTests: Boolean = false

    @CommandLine.Option(
        names = ["--exclude-technical-stopwords"],
        description = ["disable filtering of common technical words (e.g. 'test', 'util', 'handler')"]
    )
    private var excludeTechnicalStopwords: Boolean = false

    @CommandLine.Option(names = ["--no-tfidf"], description = ["disable TF-IDF scoring (enabled by default)"])
    private var noTfidf: Boolean = false

    @CommandLine.Option(names = ["--sort-by"], description = ["sort words by: \${COMPLETION-CANDIDATES} (default: FREQUENCY)"])
    private var sortBy: SortBy = SortBy.FREQUENCY

    @CommandLine.Option(
        names = ["--no-ssr"],
        description = ["disable Statistical Substring Reduction for n-grams (enabled by default when ngrams > 1)"]
    )
    private var noSsr: Boolean = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "domainlanguageparser"
        const val DESCRIPTION = "generates cc.json with a domain-language word-frequency lens from source code"

        private const val DEFAULT_IDENTIFIER_WEIGHT = 3
        private const val DEFAULT_COMMENT_WEIGHT = 2
        private const val DEFAULT_STRING_WEIGHT = 1
        private const val DEFAULT_NGRAMS = 1

        private val SUPPORTED_EXTENSIONS = Language.allExtensions().toSet()
    }

    override fun call(): Unit? {
        logExecutionStartedSyncSignal()

        val inputFileIndex = extractNonPipedInputIndex(inputFiles)
        val inputFile = inputFiles[inputFileIndex]
        require(InputHelper.isInputValidAndNotNull(arrayOf(inputFile), canInputContainFolders = true)) {
            "Input invalid file for DomainLanguageParser, stopping execution..."
        }
        validateOptions()

        val context = resolveEffectiveInput(inputFile)
        try {
            val directoryPath = context.inputDir.path
            val config = buildConfiguration(directoryPath)

            val analysisResult =
                ProgressReporterFactory.create(quiet = false).use { progressReporter ->
                    SourceAnalyzerFactory.create(config, progressReporter).analyze(directoryPath)
                }

            val project = DomainProjectGenerator().generate(analysisResult, resolvePipedProject())

            ProjectSerializer.serializeToFileOrStream(project, context.resolveOutputFile(outputFile), output, compress)
        } finally {
            context.worktreeManager?.cleanup()
        }

        return null
    }

    private fun resolvePipedProject(): Project? {
        if (!shouldProcessPipedInput(inputFiles)) return null
        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject == null) {
            Logger.warn { "Skipping piped project..." }
        }
        return pipedProject
    }

    private fun validateOptions() {
        require(identifierWeight > 0) { "--identifier-weight must be positive, got $identifierWeight" }
        require(commentWeight > 0) { "--comment-weight must be positive, got $commentWeight" }
        require(stringWeight > 0) { "--string-weight must be positive, got $stringWeight" }
        require((limit ?: 0) >= 0) { "--limit must not be negative, got $limit" }
    }

    private fun buildConfiguration(directoryPath: String): AnalysisConfiguration {
        val config = ConfigurationBuilder().build(buildParsedArguments(directoryPath))
        return if (fileExtensionsToAnalyse.isEmpty()) config else config.copy(allowedExtensions = fileExtensionsToAnalyse)
    }

    private fun buildParsedArguments(directoryPath: String): ParsedArguments = ParsedArguments(
        directory = directoryPath,
        limit = limit,
        bypassGitignore = bypassGitignore,
        excludeTests = excludeTests,
        identifierWeight = identifierWeight,
        commentWeight = commentWeight,
        stringWeight = stringWeight,
        excludeTechnicalStopWords = excludeTechnicalStopwords,
        stopWordLevel = stopWordLevel,
        ngrams = ngrams,
        noTfidf = noTfidf,
        sortBy = sortBy,
        noSsr = noSsr
    )

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        if (resourceToBeParsed.isBlank()) return false

        val searchFile = File(resourceToBeParsed.trim())
        if (searchFile.isFile) return isSupportedSource(searchFile)
        if (!searchFile.isDirectory) return false

        return searchFile
            .walk()
            .any { it.isFile && isSupportedSource(it) }
    }

    private fun isSupportedSource(file: File): Boolean = SUPPORTED_EXTENSIONS.contains(file.extension.lowercase())
}
