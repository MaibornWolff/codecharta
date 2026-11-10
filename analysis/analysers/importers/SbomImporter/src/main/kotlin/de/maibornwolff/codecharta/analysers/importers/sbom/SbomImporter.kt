package de.maibornwolff.codecharta.analysers.importers.sbom

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.CycloneDxReader
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.http.JavaHttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.http.RetryingHttpGateway
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.CodeChartaConstants
import picocli.CommandLine
import java.io.File
import java.io.InputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.time.LocalDate

@CommandLine.Command(
    name = SbomImporter.NAME,
    description = [SbomImporter.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class SbomImporter(
    private val input: InputStream = System.`in`,
    private val output: PrintStream = System.out,
    private val error: PrintStream = System.err,
    private val http: () -> HttpGateway = { RetryingHttpGateway(JavaHttpGateway()) },
    private val today: () -> LocalDate = LocalDate::now
) : AnalyserInterface {
    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["CycloneDX JSON SBOM, e.g. from trivy, cdxgen or syft"])
    private var sbomFile: File? = null

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(
        names = ["--project-folder"],
        description = ["folder the SBOM was made from, to find its lockfiles in (default: current folder)"]
    )
    private var projectFolder: File = File(".")

    @CommandLine.Option(names = ["--osv"], description = ["ask OSV.dev for vulnerabilities of packages the SBOM's scanner did not check"])
    private var isOsvAsked = false

    @CommandLine.Option(
        names = ["--deps-dev"],
        description = ["ask deps.dev for newer versions to measure dependency lag and outdated packages"]
    )
    private var isDepsDevAsked = false

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    private var outputFile: String? = null

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    private var compress = true

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "sbomimport"
        const val DESCRIPTION = "generates cc.json with a security lens from a CycloneDX SBOM"

        @JvmStatic
        fun mainWithInOut(input: InputStream, output: PrintStream, error: PrintStream, args: Array<String>) {
            CommandLine(SbomImporter(input, output, error)).setOut(PrintWriter(output)).execute(*args)
        }
    }

    override fun call(): Unit? {
        logExecutionStartedSyncSignal()
        val file = requireNotNull(sbomFile)
        require(file.isFile) { "SBOM file not found: ${file.path}" }
        val bom = CycloneDxReader.read(file)
        val result = SbomImport.withLookups(projectFolder, SbomLookups(isOsvAsked, isDepsDevAsked), http, today).run(bom)
        val pipedProject = ProjectDeserializer.deserializeProject(input)
        val project = pipedProject?.let { MergeFilter.mergePipedWithCurrentProject(it, result.project) } ?: result.project
        ProjectSerializer.serializeToFileOrStream(project, outputFile, output, compress)
        result.hints.forEach { error.println(it) }
        return null
    }

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean = false
}
