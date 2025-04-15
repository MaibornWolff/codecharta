package de.maibornwolff.codecharta.analysers.importers.sonar

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarVersionAPIDatasource
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeGenerator
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream
import java.net.URL

@CommandLine.Command(
    name = SonarImporter.NAME,
    description = [SonarImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class SonarImporter(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out
) : AnalyserInterface, AttributeGenerator {
    @CommandLine.Option(
        names = ["-h", "--help"],
        usageHelp = true,
        description = [
            "Please locate:\n" +
                "-    sonar.host.url=https://sonar.foo\n" +
                "-    sonar.login=c123d456\n" +
                "-    sonar.projectKey=de.foo:bar\n" +
                "That you use to upload your code to sonar.\n" +
                "Then execute [sonarimport https://sonar.foo de.foo:bar -u c123d456]"
        ]
    )
    private var help = false

    @CommandLine.Parameters(index = "0", arity = "1", paramLabel = "URL", description = ["url of sonarqube server"])
    private var url: String = "http://localhost"

    @CommandLine.Parameters(
        index = "1",
        arity = "1..1",
        paramLabel = "PROJECT_ID",
        description = ["sonarqube project id"]
    )
    private var projectId = ""

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFile: String? = null

    @CommandLine.Option(
        names = ["-m", "--metrics"],
        description = [
            "comma-separated list of metrics to import " +
                "(when using powershell, the list either can't contain spaces or has to be in quotes)"
        ],
        converter = [(CommaSeparatedStringToListConverter::class)],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    private var metrics = mutableListOf<String>()

    @CommandLine.Option(
        names = ["-u", "--user-token"],
        description = ["user token for connecting to remote sonar instance"]
    )
    private var userToken = ""

    @CommandLine.Option(
        names = ["-nc", "--not-compressed"],
        description = ["save uncompressed output File"],
        arity = "0"
    )
    private var compress = true

    @CommandLine.Option(names = ["--merge-modules"], description = ["merges modules in multi-module projects"])
    private var usePath = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "sonarimport"
        const val DESCRIPTION = "generates cc.json from metric data from SonarQube"
    }

    private fun createMeasuresAPIImporter(): SonarMeasuresAPIImporter {
        if (url.endsWith("/")) url = url.substring(0, url.length - 1)
        val baseUrl = URL(url)
        val version = SonarVersionAPIDatasource(userToken, baseUrl).getSonarqubeVersion()
        val measuresDatasource = SonarMeasuresAPIDatasource(userToken, baseUrl, version)
        val metricsDatasource = SonarMetricsAPIDatasource(userToken, baseUrl)
        val sonarCodeURLLinker = SonarCodeURLLinker(baseUrl)
        val translator = SonarMetricTranslatorFactory.createMetricTranslator()

        return SonarMeasuresAPIImporter(measuresDatasource, metricsDatasource, sonarCodeURLLinker, translator, usePath)
    }

    override fun call(): Unit? {
        if (url == "" || projectId == "") {
            throw IllegalArgumentException("Input invalid Url or ProjectID for SonarImporter, stopping execution...")
        }

        val importer = createMeasuresAPIImporter()
        var project = importer.getProjectFromMeasureAPI(projectId, metrics)

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        println("Checking if SonarImporter is applicable...")

        val trimmedInput = resourceToBeParsed.trim()
        val inputFile = File(trimmedInput)
        if (isUrl(trimmedInput) || isSonarPropertiesFile(inputFile)) {
            return true
        }
        if (!ResourceSearchHelper.isSearchableDirectory(inputFile)) {
            return false
        }

        return inputFile.walk().maxDepth(2).asSequence().filter { isSonarPropertiesFile(it) }.any()
    }

    private fun isUrl(inputString: String): Boolean {
        return inputString.contains("^http(s)?://".toRegex())
    }

    private fun isSonarPropertiesFile(inputFile: File): Boolean {
        val searchFile = "sonar-project.properties"
        return (inputFile.isFile && inputFile.name == searchFile)
    }

    override fun getAttributeDescriptorMaps(): Map<String, AttributeDescriptor> {
        return getAttributeDescriptors()
    }
}
