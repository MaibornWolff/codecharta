package de.maibornwolff.codecharta.analysers.importers.coverage

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.endsWithAtLeastOne
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.getFileFromStringIfExists
import picocli.CommandLine
import java.io.File
import java.io.FileNotFoundException
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.util.Locale

@CommandLine.Command(
    name = CoverageImporter.NAME,
    description = [CoverageImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class CoverageImporter(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : AnalyserInterface, AttributeGenerator {
    @CommandLine.Option(
        names = ["-l", "--language"],
        description = ["Specify the language of the coverage report (e.g., javascript, typescript, js, ts)"],
        required = true
    )
    private var language: String = "Not specified"

    @CommandLine.Parameters(
        arity = "0..1",
        paramLabel = "pathToReportFile",
        description = ["Path to the coverage report file (leave empty for default)"]
    )
    private var reportFileName: String? = null

    @CommandLine.Option(
        names = ["-h", "--help"],
        usageHelp = true,
        description = ["Displays this help and exits"]
    )
    private var help = false

    @CommandLine.Option(
        names = ["-nc", "--not-compressed"],
        description = ["Save uncompressed output file"]
    )
    private var compress: Boolean = true

    @CommandLine.Option(
        names = ["-o", "--output-file"],
        description = ["Output file (or empty for stdout)"],
        paramLabel = "<outputFilePath>"
    )
    private var outputFilePath: String? = null

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "coverageimport"
        const val DESCRIPTION = "generates cc.json from coverage reports"

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine(CoverageImporter()).execute(*args)
        }

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine(CoverageImporter(input, output, error)).setOut(PrintWriter(output)).execute(*args)
        }
    }

    @Throws(IOException::class)
    override fun call() {
        val languageInput = language.lowercase(Locale.getDefault())

        require(isLanguageForLanguageInputSupported(languageInput)) { "Unsupported language: $languageInput" }

        val language = getLanguageForLanguageInput(languageInput)

        val reportFile = getReportFileFromString(reportFileName ?: ".", language)

        val projectBuilder = ProjectBuilder()

        language.strategy.addNodesToProjectBuilder(reportFile, projectBuilder, error)
        projectBuilder.addAttributeTypes(getAttributeTypes(language))
        projectBuilder.addAttributeDescriptions(getAttributeDescriptors(language))
        var project = projectBuilder.build()

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, output, compress)
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if CoverageImporter is applicable...")
        return isAnyStrategyApplicable(resourceToBeParsed)
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }

    internal fun getReportFileFromString(resourceToSearch: String, language: Language): File {
        val existingFileOrDirectory = getFileFromStringIfExists(resourceToSearch)
            ?: throw FileNotFoundException("File not found: $resourceToSearch")
        if (existingFileOrDirectory.isFile) {
            if (endsWithAtLeastOne(existingFileOrDirectory.name, language.fileExtensions)) {
                return existingFileOrDirectory
            }
            throw FileNotFoundException(
                "File: $resourceToSearch does not match any known file extension: ${language.fileExtensions.map { it.extension }}"
            )
        }

        println("Scanning directory `${existingFileOrDirectory.absolutePath}` for matching files.")

        val foundFiles = existingFileOrDirectory.walk().asSequence().filter {
            it.isFile && it.name == language.defaultReportFileName
        }.toList()

        if (foundFiles.isEmpty()) {
            throw FileNotFoundException(
                "No files matching ${language.defaultReportFileName} found in directory: ${existingFileOrDirectory.absolutePath}"
            )
        }

        if (foundFiles.size > 1) {
            throw FileNotFoundException(
                "Multiple files matching ${language.defaultReportFileName} found in directory: ${existingFileOrDirectory.absolutePath}. " +
                    "Please specify only one."
            )
        }

        return foundFiles.first()
    }
}
