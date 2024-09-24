package de.maibornwolff.codecharta.parser.gitlogparser.subcommands

import de.maibornwolff.codecharta.parser.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.parser.gitlogparser.util.GitAdapter
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(
    name = RepoScanCommand.NAME,
    description = [RepoScanCommand.DESCRIPTION],
    footer = ["Copyright(c) 2024, MaibornWolff GmbH"]
)
class RepoScanCommand : Callable<Unit>, InteractiveParser {
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

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "repo-scan"
        const val DESCRIPTION =
            "git log parser repo-scan - generates cc.json from an automatically generated git-log file"
    }

    override fun call(): Unit? {
        val repoPath: Path
        if (repoPathName == null ||
            !InputHelper.isInputValid(
                arrayOf(File(repoPathName!!)),
                canInputContainFolders = true
            )
        ) {
            throw IllegalArgumentException("Input invalid file for GitRepoScan, stopping execution...")
        } else {
            repoPath = Paths.get(repoPathName!!).normalize().toAbsolutePath()
        }
        println("Creating git.log file...")
        val gitLogFile = createGitLogFile(repoPath)
        println("Creating git-ls file...")
        val gitLsFile = createGitLsFile(repoPath)

        println("Parsing files...")
        GitLogParser().buildProject(gitLogFile, gitLsFile, outputFilePath, addAuthor, silent, compress)
        return null
    }

    private fun createGitLogFile(repoPath: Path): File {
        val tempGitLog = File.createTempFile("git", ".log")
        tempGitLog.deleteOnExit()

        val adapter = GitAdapter(repoPath.toFile(), tempGitLog)
        adapter.getGitLog()

        return tempGitLog
    }

    private fun createGitLsFile(repoPath: Path): File {
        val tempGitLs = File.createTempFile("file-name-list", ".txt")
        tempGitLs.deleteOnExit()

        val adapter = GitAdapter(repoPath.toFile(), tempGitLs)
        adapter.getGitFiles()

        return tempGitLs
    }

    override fun getDialog(): ParserDialogInterface = RepoScanParserDialog

    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }
}
