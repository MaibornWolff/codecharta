package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.commit.CommitAnalysisContext
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.FileExtension
import picocli.CommandLine
import java.io.File
import java.io.PrintStream

@CommandLine.Command(
    name = AnalyseTool.NAME,
    description = [AnalyseTool.DESCRIPTION],
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class AnalyseTool(
    private val output: PrintStream = System.out,
    private val workingFolder: File = File("."),
    private val svnLogWriter: SvnLogWriter = SvnLogWriter(),
    private val createParsers: () -> List<AnalyserInterface> = CodeParsers::create
) : AnalyserInterface,
    CommandLine.IExitCodeGenerator {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "0..1", paramLabel = "FOLDER", description = ["project folder (default: the current folder)"])
    private var projectFolder: File? = null

    @CommandLine.Option(
        names = ["-o", "--output-file"],
        description = ["output file (default: <folder name>.cc.json.gz in the current folder)"]
    )
    private var outputFile: String? = null

    @CommandLine.Option(
        names = ["-e", "--exclude"],
        description = ["comma-separated list of regex patterns to exclude files/folders"],
        converter = [CommaSeparatedStringToListConverter::class],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    private var excludePatterns: List<String> = listOf()

    @CommandLine.Option(
        names = ["--without"],
        paramLabel = "NAME",
        description = ["comma-separated parsers or histories to leave out, such as dependencyparser,svn"],
        converter = [CommaSeparatedStringToListConverter::class],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    private var leftOut: List<String> = listOf()

    @CommandLine.Option(
        names = ["--local-changes"],
        description = ["maps only the files that differ from the remote tracking branch (unpushed, staged, unstaged, untracked)"]
    )
    private var localChanges = false

    @CommandLine.Option(
        names = ["--commit"],
        paramLabel = "REF",
        description = ["maps the codebase as it was at this git commit, tag, branch or date (the map name starts with its short hash)"]
    )
    private var commit: String? = null

    @CommandLine.Option(names = ["-p", "--parallel"], description = ["runs the analysers at the same time"])
    private var parallel = false

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["writes the map uncompressed"])
    private var notCompressed = false

    @CommandLine.Option(names = ["-q", "--quiet"], description = ["keeps the output of the analysers off the console"])
    private var quiet = false

    private var exitCode = SUCCESS

    override val name = NAME
    override val description = DESCRIPTION

    override fun call(): Unit? {
        exitCode = guarded(::run)
        return null
    }

    private fun run(): Int {
        val folder = projectFolder ?: workingFolder
        if (!folder.isDirectory) throw AnalysisException("The folder ${folder.path} does not exist.")
        val leftOutSources = leftOutSources()
        val console = AnalysisConsole(output, quiet)
        val commitRef = commitRef()
        val checkout = console.whileAnalysing { CommitAnalysisContext.at(folder, commitRef) }
        try {
            CodebaseAnalysis(console, svnLogWriter, createParsers).run(requestFor(folder, checkout, leftOutSources))
        } finally {
            checkout.worktreeManager?.cleanup()
        }
        return SUCCESS
    }

    private fun requestFor(folder: File, checkout: CommitAnalysisContext, leftOutSources: Set<String>) = AnalyseRequest(
        projectFolder = folder,
        outputFile = outputFileFor(folder, checkout),
        excludePatterns = excludePatterns,
        leftOut = leftOutSources,
        parallel = parallel,
        compress = !notCompressed,
        analysedFolder = checkout.inputDir,
        commitHash = checkout.shortHash,
        localChanges = localChanges
    )

    private fun commitRef(): String? {
        val commitRef = commit?.trim()?.ifEmpty { null }
        if (commitRef != null && localChanges) throw AnalysisException("--commit and --local-changes are mutually exclusive.")
        return commitRef
    }

    private fun leftOutSources(): Set<String> {
        val leavableSources = createParsers().map { it.name } + VersionControl.entries.map { it.label }
        val leftOutSources = leftOut.map(VersionControl::sourceNameOf).toSet()
        val unknownSource = leftOutSources.firstOrNull { it !in leavableSources } ?: return leftOutSources
        throw AnalysisException("--without does not know $unknownSource. Leave out one of: ${leavableSources.joinToString()}")
    }

    private fun outputFileFor(folder: File, checkout: CommitAnalysisContext): File {
        val chosen = outputFile ?: File(workingFolder, folder.absoluteFile.normalize().name.ifEmpty { DEFAULT_MAP_NAME }).path
        val atCommit = checkout.resolveOutputFile(chosen) ?: chosen
        return File(OutputFileHandler.checkAndFixFileExtension(atCommit, !notCompressed, FileExtension.JSON))
    }

    private fun guarded(action: () -> Int): Int = try {
        action()
    } catch (exception: AnalysisException) {
        failure(exception.message)
    } catch (exception: Exception) {
        failure("ccsh analyse failed: ${exception.message ?: exception::class.simpleName}")
    }

    private fun failure(message: String?): Int {
        output.println(message)
        return FAILURE
    }

    override fun getExitCode(): Int = exitCode

    override fun getDialog(): AnalyserDialogInterface = Dialog

    override fun isApplicable(resourceToBeParsed: String): Boolean = false

    override fun shouldAskForArguments(): Boolean = false

    companion object {
        const val NAME = "analyse"
        const val DESCRIPTION = "maps a codebase with every applicable parser and its git or svn history"
        private const val DEFAULT_MAP_NAME = "project"
        private const val SUCCESS = 0
        private const val FAILURE = 1
    }
}
