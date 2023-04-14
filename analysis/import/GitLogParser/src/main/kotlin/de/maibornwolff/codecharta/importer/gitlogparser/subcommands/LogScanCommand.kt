package de.maibornwolff.codecharta.importer.gitlogparser.subcommands

import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "log-scan",
    description = ["git log parser log-scan - generates cc.json from a given git-log file"],
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)

class LogScanCommand : Callable<Void>, InteractiveParser {

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

    override fun call(): Void? {
        GitLogParser().buildProject(gitLogFile!!, gitLsFile!!, outputFilePath, addAuthor, silent, compress)
        return null
    }

    override fun getDialog(): ParserDialogInterface = LogScanParserDialog
    override fun isUsable(inputFile: String): Boolean {
        return false
    }
}
