package de.maibornwolff.codecharta.importer.coverage

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.importer.coverage.languages.getStrategyForLanguage
import de.maibornwolff.codecharta.importer.coverage.languages.isAnyStrategyApplicable
import de.maibornwolff.codecharta.importer.coverage.languages.isLanguageSupported
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.tools.pipeableparser.PipeableParser
import picocli.CommandLine
import java.io.IOException
import java.io.InputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.util.Locale
import java.util.concurrent.Callable

@CommandLine.Command(
    name = CoverageImporter.NAME,
    description = [CoverageImporter.DESCRIPTION],
    footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class CoverageImporter(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Unit>, InteractiveParser, PipeableParser, AttributeGenerator {
    @CommandLine.Option(
        names = ["-l", "--language"],
        description = ["Specify the language of the coverage report (e.g., javascript, typescript, js, ts)"],
        required = true
    )
    private var language: String = "Not specified"

    @CommandLine.Option(
        names = ["-rf", "--report-file"],
        description = ["Path to the coverage report file (leave empty for default)"],
        paramLabel = "<reportFilePath>"
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
        val language = language.lowercase(Locale.getDefault())

        if (!isLanguageSupported(language)) {
            throw IllegalArgumentException("Unsupported language: $language")
        }

        val languageStrategy = getStrategyForLanguage(language)

        val reportFile = languageStrategy.getReportFileFromString(reportFileName ?: ".")

        val projectBuilder = ProjectBuilder()

        languageStrategy.addNodesToProjectBuilder(reportFile, projectBuilder)
        projectBuilder.addAttributeTypes(getAttributeTypes())
        projectBuilder.addAttributeDescriptions(getAttributeDescriptors())
        var project = projectBuilder.build()

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFilePath, output, compress)
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if CoverageImporter is applicable...")
        return isAnyStrategyApplicable(resourceToBeParsed)
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
