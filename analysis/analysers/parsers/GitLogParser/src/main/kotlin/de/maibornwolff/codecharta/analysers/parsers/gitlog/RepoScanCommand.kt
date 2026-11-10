package de.maibornwolff.codecharta.analysers.parsers.gitlog

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.commit.CommitAnalysisContext
import de.maibornwolff.codecharta.analysers.analyserinterface.commit.GitWorktreeManager
import de.maibornwolff.codecharta.analysers.parsers.gitlog.authors.AuthorHistory
import de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges.CommitChangesScan
import de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership.AuthorOwnershipScan
import de.maibornwolff.codecharta.analysers.parsers.gitlog.util.GitAdapter
import de.maibornwolff.codecharta.model.ClustersLens
import de.maibornwolff.codecharta.util.InputHelper
import picocli.CommandLine
import java.io.File
import java.nio.file.Path
import java.nio.file.Paths
import java.time.LocalDate

@CommandLine.Command(
    name = RepoScanCommand.NAME,
    description = [RepoScanCommand.DESCRIPTION],
    footer = ["Copyright(c) 2024, MaibornWolff GmbH"]
)
class RepoScanCommand(private val printsClusterHints: Boolean = true) : AnalyserInterface {
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

    @CommandLine.Option(
        names = ["--commit"],
        description = ["analyze the repository at a specific git commit (creates a temporary worktree)"]
    )
    private var commit: String? = null

    @CommandLine.Option(
        names = [AuthorOwnershipScan.FLAG],
        description = ["add the share of each file's lines last changed by each author, under an invented name (blames every file)"]
    )
    private var authorOwnership = false

    @CommandLine.Option(
        names = [AuthorOwnershipScan.NAMES_FLAG],
        description = [
            "write the real names of the authors into the map instead, also for commit changes " +
                "(personal data, needs ${AuthorOwnershipScan.FLAG})"
        ]
    )
    private var withAuthorNames = false

    @CommandLine.Option(
        names = [CommitChangesScan.FLAG],
        paramLabel = CommitChangesScan.DATE_LABEL,
        description = [CommitChangesScan.OPTION_DESCRIPTION]
    )
    private var commitChangesSince: LocalDate? = null

    override val name = NAME
    override val description = DESCRIPTION

    companion object {
        const val NAME = "repo-scan"
        const val DESCRIPTION =
            "git log parser repo-scan - generates cc.json from an automatically generated git-log file"
    }

    override fun call(): Unit? {
        require(
            repoPathName != null &&
                InputHelper.isInputValid(
                    arrayOf(File(repoPathName!!)),
                    canInputContainFolders = true
                )
        ) { "Input invalid file for GitRepoScan, stopping execution..." }

        require(authorOwnership || !withAuthorNames) { AuthorOwnershipScan.NEEDS_OWNERSHIP_HINT }

        val repoPath = Paths.get(repoPathName!!).normalize().toAbsolutePath()
        val context = resolveCommitContext(repoPath)

        try {
            if (!silent) println("Creating git.log file...")
            val gitLogFile = createGitLogFile(context.inputDir.toPath())
            if (!silent) println("Creating git-ls file...")
            val gitLsFile = createGitLsFile(context.inputDir.toPath())

            val authorHistory = AuthorHistory(context.inputDir)
            val ownershipScan = AuthorOwnershipScan(context.inputDir, withAuthorNames, authorHistory).takeIf { authorOwnership }
            if (!silent && ownershipScan != null) println("Blaming files...")
            val ownership = ownershipScan?.lens() ?: ClustersLens()

            val commitChangesScan = commitChangesSince?.let { CommitChangesScan(context.inputDir, it, withAuthorNames, authorHistory) }
            if (!silent && commitChangesScan != null) println("Reading the changes of each commit...")
            val commitChanges = commitChangesScan?.lens() ?: ClustersLens()

            if (!silent) println("Parsing files...")
            GitLogParser().buildProject(
                gitLogFile,
                gitLsFile,
                context.resolveOutputFile(outputFilePath),
                addAuthor,
                silent,
                compress,
                ownership.merge(commitChanges)
            )
            if (ownershipScan != null) printOwnershipHints(ownershipScan)
            if (commitChangesScan != null) printCommitChangesHints(commitChangesScan, commitChanges)
        } finally {
            context.worktreeManager?.cleanup()
        }

        return null
    }

    private fun printOwnershipHints(ownershipScan: AuthorOwnershipScan) {
        if (!printsClusterHints) return
        // Not even --silent keeps this back: nobody may end up with names in a map without having been told
        if (withAuthorNames) System.err.println(AuthorOwnershipScan.REAL_NAMES_WARNING)
        if (silent) return
        if (ownershipScan.isShallowClone()) System.err.println(AuthorOwnershipScan.SHALLOW_CLONE_WARNING)
        if (!withAuthorNames) System.err.println(AuthorOwnershipScan.PERSONAL_DATA_NOTE)
    }

    private fun printCommitChangesHints(scan: CommitChangesScan, commitChanges: ClustersLens) {
        if (!printsClusterHints || silent) return
        if (scan.isShallowClone()) System.err.println(CommitChangesScan.SHALLOW_CLONE_WARNING)
        val carriesCommitChanges = CommitChangesScan.carriesCommitChanges(commitChanges)
        System.err.println(
            if (carriesCommitChanges) CommitChangesScan.PERSONAL_DATA_NOTE else CommitChangesScan.noCommitHint(commitChangesSince!!)
        )
    }

    private fun resolveCommitContext(repoPath: Path): CommitAnalysisContext {
        val commitRef = commit?.trim()?.takeIf { it.isNotEmpty() }
        if (commitRef == null) return CommitAnalysisContext(repoPath.toFile(), null, null)

        val manager = GitWorktreeManager(repoPath.toFile())
        val resolvedCommit = manager.resolveCommitHash(commitRef)
        val shortHash = manager.shortCommitHash(resolvedCommit)
        val worktreeDir = manager.createWorktree(resolvedCommit)
        return CommitAnalysisContext(worktreeDir, manager, shortHash)
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

    override fun getDialog(): AnalyserDialogInterface = RepoScanDialog

    override fun isApplicable(resourceToBeParsed: String): Boolean = false
}
