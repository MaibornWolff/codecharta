package de.maibornwolff.codecharta.importer.gitlogparser.subcommands

import com.lordcodes.turtle.ShellFailedException
import com.lordcodes.turtle.shellRun
import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import picocli.CommandLine
import java.io.File
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "repo-scan",
    description = ["git log parser log-scan - generates cc.json from a generated git-log file"],
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)

class RepoScanCommand : Callable<Void>, InteractiveParser {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(
        names = ["--repo-path"],
        arity = "1",
        paramLabel = "DIRECTORY",
        description = ["root directory of the repository"]
    )
    private var repoPathName: String? = null

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File"])
    private var outputFilePath: String? = null

    @CommandLine.Option(
        names = ["-nc", "--not-compressed"],
        description = ["save uncompressed output File"]
    )
    private var compress = true

    @CommandLine.Option(names = ["--silent"], description = ["suppress command line output during process"])
    private var silent = false

    @CommandLine.Option(names = ["--add-author"], description = ["add an array of authors to every file"])
    private var addAuthor = false

    override fun call(): Void? {
        // TODO: Do Clean Code magic
        val repoPath: Path
        if (repoPathName.isNullOrBlank()) {
            repoPath = Paths.get("").toAbsolutePath()
            println("--repo-path not set, assuming current working directory ($repoPath)")
        } else {
            repoPath = Paths.get(repoPathName!!).toAbsolutePath()
        }

        val gitLogFile = createGitLogFile(repoPath)
        val gitLsFile = createGitLsFile(repoPath)

        GitLogParser().buildProject(gitLogFile, gitLsFile, outputFilePath, addAuthor, silent, compress)
        return null
    }

    private fun createGitLogFile(repoPath: Path): File {
        val tempGitLog = File.createTempFile("git", ".log")
        tempGitLog.deleteOnExit()
        try {
            shellRun(
                command = "git",
                arguments = listOf(
                    "log", "--numstat", "--raw", "--topo-order", "--reverse", "-m", ">", tempGitLog.absolutePath
                ),
                workingDirectory = repoPath.toFile()
            )
        } catch (e: ShellFailedException) {
            println("ERROR: Could not create git log file.")
            throw e
        }

        return tempGitLog
    }

    private fun createGitLsFile(repoPath: Path): File {
        val tempGitLs = File.createTempFile("file-name-list", ".txt")
        tempGitLs.deleteOnExit()
        try {
            shellRun(
                command = "git",
                arguments = listOf(
                    "git ls-files", ">", tempGitLs.absolutePath
                ),
                workingDirectory = repoPath.toFile()
            )
        } catch (e: ShellFailedException) {
            println("ERROR: Could not create git ls file.")
            throw e
        }
        return tempGitLs
    }

    override fun getDialog(): ParserDialogInterface = LogScanParserDialog
}
