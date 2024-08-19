package de.maibornwolff.codecharta.parser.gitlogparser.subcommands

import de.maibornwolff.codecharta.parser.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.tools.interactiveparser.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
    name = LogScanCommand.NAME,
    description = [LogScanCommand.DESCRIPTION],
    footer = [CodeChartaConstants.General.GENERIC_FOOTER]
)
class LogScanCommand : Callable<Unit>, InteractiveParser {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(
        names = ["--git-log"],
        arity = "1",
        paramLabel = "FILE",
        required = true,
        description = ["git-log file to parse"]
    )
    private var gitLogFile: File? = null

    @CommandLine.Option(
        names = ["--repo-files"],
        arity = "1",
        paramLabel = "FILE",
        required = true,
        description = ["list of all file names in current git project"]
    )
    private var gitLsFile: File? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFilePath: String? = null

    @CommandLine.Option(
        names = ["-nc", "--not-compressed"],
        description = ["save uncompressed output File"],
        arity = "0"
    )
    private var compress = true

    @CommandLine.Option(names = ["--silent"], description = ["suppress command line output during process"])
    private var silent = false

    @CommandLine.Option(names = ["--add-author"], description = ["add an array of authors to every file"])
    private var addAuthor = false

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "log-scan"
        const val DESCRIPTION = "git log parser log-scan - generates cc.json from a given git-log file"
    }

    override fun call(): Unit? {
        if (!InputHelper.isInputValidAndNotNull(arrayOf(gitLogFile), canInputContainFolders = false)) {
            throw IllegalArgumentException("Input invalid file for GitLogScan, stopping execution...")
        }
        GitLogParser().buildProject(gitLogFile!!, gitLsFile!!, outputFilePath, addAuthor, silent, compress)
        return null
    }

    override fun getDialog(): ParserDialogInterface = LogScanParserDialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
