package de.maibornwolff.codecharta.importer.gitlogparser.subcommands

import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.importer.gitlogparser.util.GitAdapter
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import picocli.CommandLine
import java.io.File
import java.io.FileWriter
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "repo-scan",
    description = ["git log parser repo-scan - generates cc.json from an automatically generated git-log file"],
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
        val repoPath: Path
        if (repoPathName.isNullOrBlank()) {
            repoPath = Paths.get("").normalize().toAbsolutePath()
            println("--repo-path not set, assuming current working directory ($repoPath)")
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

        val fileWriter = FileWriter(tempGitLog)
        GitAdapter(repoPath.toFile()).getGitLog().forEach { fileWriter.write(it + System.lineSeparator()) }

        return tempGitLog
    }

    private fun createGitLsFile(repoPath: Path): File {
        val tempGitLs = File.createTempFile("file-name-list", ".txt")
        tempGitLs.deleteOnExit()
        val fileWriter = FileWriter(tempGitLs)
        GitAdapter(repoPath.toFile()).getGitFiles().forEach { fileWriter.write(it + System.lineSeparator()) }
        return tempGitLs
    }

    override fun getDialog(): ParserDialogInterface = RepoScanParserDialog
    override fun isApplicable(resourceToBeParsed: String): Boolean {
        return false
    }

    override fun getName(): String {
        return "repo-scan"
    }
}
