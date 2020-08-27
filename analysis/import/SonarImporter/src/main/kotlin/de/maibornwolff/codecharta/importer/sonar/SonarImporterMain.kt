package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.FileWriter
import java.io.InputStream
import java.io.OutputStreamWriter
import java.io.PrintStream
import java.io.Writer
import java.net.URL
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "sonarimport",
    description = ["generates cc.json from metric data from SonarQube"],
    footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
)
class SonarImporterMain(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err
) : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(index = "0", paramLabel = "URL", description = ["url of sonarqube server"])
    private var url: String = "http://localhost"

    @CommandLine.Parameters(
        index = "1", arity = "1..1", paramLabel = "PROJECT_ID",
        description = ["sonarqube project id"]
    )
    private var projectId = ""

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @CommandLine.Option(names = ["-m", "--metrics"], description = ["comma-separated list of metrics to import"])
    private var metrics = mutableListOf<String>()

    @CommandLine.Option(names = ["-u", "--user"], description = ["user token for connecting to remote sonar instance"])
    private var user = ""

    @CommandLine.Option(names = ["-c"], description = ["compress output File to gzip format"])
    private var compress = false

    @CommandLine.Option(names = ["--merge-modules"], description = ["merges modules in multi-module projects"])
    private var usePath = false

    private fun writer(): Writer {
        return if (outputFile.isEmpty()) {
            OutputStreamWriter(output)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    private fun createMesauresAPIImporter(): SonarMeasuresAPIImporter {
        if (url.endsWith("/")) url = url.substring(0, url.length - 1)
        val baseUrl = URL(url)
        val ds = SonarMeasuresAPIDatasource(user, baseUrl)
        val metricsDS = SonarMetricsAPIDatasource(user, baseUrl)
        val sonarCodeURLLinker = SonarCodeURLLinker(baseUrl)
        val translator = SonarMetricTranslatorFactory.createMetricTranslator()

        return SonarMeasuresAPIImporter(ds, metricsDS, sonarCodeURLLinker, translator, usePath)
    }

    override fun call(): Void? {
        print(" ")
        val importer = createMesauresAPIImporter()
        var project = importer.getProjectFromMeasureAPI(projectId, metrics)

        val pipedProject = ProjectDeserializer.deserializeProject(input)
        if (pipedProject != null) {
            project = MergeFilter.mergePipedWithCurrentProject(pipedProject, project)
        }

        if (compress) ProjectSerializer.serializeAsCompressedFile(project, outputFile) else ProjectSerializer.serializeProject(project, writer())

        return null
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(SonarImporterMain(), System.out, *args)
        }

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine.call(SonarImporterMain(input, output, error), output, *args)
        }
    }
}
