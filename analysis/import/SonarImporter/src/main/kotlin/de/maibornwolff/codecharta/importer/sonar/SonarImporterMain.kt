package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarVersionAPIDatasource
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.InteractiveParserHelper
import de.maibornwolff.codecharta.util.ResourceSearchHelper
import picocli.CommandLine
import java.io.InputStream
import java.io.PrintStream
import java.net.URL
import java.util.concurrent.Callable

@CommandLine.Command(
    name = InteractiveParserHelper.SonarImporterConstants.name,
    description = [InteractiveParserHelper.SonarImporterConstants.description],
    footer = [InteractiveParserHelper.GeneralConstants.GenericFooter]
)
class SonarImporterMain(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out
) : Callable<Void>, InteractiveParser {

    @CommandLine.Option(
        names = ["-h", "--help"], usageHelp = true, description = [
            "Please locate:\n" +
                    "-    sonar.host.url=https://sonar.foo\n" +
                    "-    sonar.login=c123d456\n" +
                    "-    sonar.projectKey=de.foo:bar\n" +
                    "That you use to upload your code to sonar.\n" +
                    "Then execute [sonarimport https://sonar.foo de.foo:bar -u c123d456]"]
    )
    private var help = false

    @CommandLine.Parameters(index = "0", paramLabel = "URL", description = ["url of sonarqube server"])
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

    @CommandLine.Option(names = ["-m", "--metrics"], description = ["comma-separated list of metrics to import"])
    private var metrics = mutableListOf<String>()

    @CommandLine.Option(names = ["-u", "--user"], description = ["user token for connecting to remote sonar instance"])
    private var user = ""

    @CommandLine.Option(
        names = ["-nc", "--not-compressed"],
        description = ["save uncompressed output File"],
        arity = "0"
    )
    private var compress = true

    @CommandLine.Option(names = ["--merge-modules"], description = ["merges modules in multi-module projects"])
    private var usePath = false

    private fun createMeasuresAPIImporter(): SonarMeasuresAPIImporter {
        if (url.endsWith("/")) url = url.substring(0, url.length - 1)
        val baseUrl = URL(url)
        val version = SonarVersionAPIDatasource(user, baseUrl).getSonarqubeVersion()
        val measuresDatasource = SonarMeasuresAPIDatasource(user, baseUrl, version)
        val metricsDatasource = SonarMetricsAPIDatasource(user, baseUrl)
        val sonarCodeURLLinker = SonarCodeURLLinker(baseUrl)
        val translator = SonarMetricTranslatorFactory.createMetricTranslator()

        return SonarMeasuresAPIImporter(measuresDatasource, metricsDatasource, sonarCodeURLLinker, translator, usePath)
    }

    override fun call(): Void? {

        val importer = createMeasuresAPIImporter()
        var project = importer.getProjectFromMeasureAPI(projectId, metrics)

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)

        return null
    }

    override fun getDialog(): ParserDialogInterface = ParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        val trimmedInput = resourceToBeParsed.trim()

        if (trimmedInput.contains("^http(s)?://".toRegex())) {
            return true
        }

        return ResourceSearchHelper.isResourcePresent(trimmedInput, "sonar-project.properties",
                ResourceSearchHelper::doStringsEqual, 0,
                shouldSearchFullDirectory = true, resourceShouldBeFile = true)
    }

    override fun getName(): String {
        return InteractiveParserHelper.SonarImporterConstants.name
    }
}
