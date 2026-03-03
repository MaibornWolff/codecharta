package de.maibornwolff.codecharta.analysers.analyserinterface

import de.maibornwolff.codecharta.analysers.analyserinterface.commit.CommitAnalysisContext
import de.maibornwolff.codecharta.analysers.analyserinterface.commit.GitWorktreeManager
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.analysers.analyserinterface.util.FileExtensionConverter
import picocli.CommandLine
import java.io.File

abstract class CommonAnalyserParameters {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    protected var help = false

    @CommandLine.Parameters(
        arity = "1..2",
        paramLabel = "FILE or FOLDER",
        description = [
            "file/project to parse. To merge the result with an existing project piped into STDIN, " +
                "pass a '-' as an additional argument"
        ]
    )
    protected var inputFiles: List<File> = mutableListOf()

    @CommandLine.Option(names = ["-o", "--output-file"], description = ["output File (or empty for stdout)"])
    protected var outputFile: String? = null

    @CommandLine.Option(names = ["--verbose"], description = ["verbose mode"])
    protected var verbose = false

    @CommandLine.Option(names = ["-nc", "--not-compressed"], description = ["save uncompressed output File"])
    protected var compress = true

    @CommandLine.Option(
        names = ["-e", "--exclude"],
        description = [
            "comma-separated list of regex patterns to exclude files/folders " +
                "(when using powershell, the list either can't contain spaces or has to be in quotes)"
        ],
        converter = [(CommaSeparatedStringToListConverter::class)],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    protected var specifiedExcludePatterns: List<String> = listOf()

    @CommandLine.Option(
        names = ["-ibf", "--include-build-folders"],
        description = [
            "include build folders (out, build, dist and target) and " +
                "common resource folders (e.g. resources, node_modules or files/folders starting with '.')"
        ]
    )
    protected var includeBuildFolders = false

    @CommandLine.Option(
        names = ["-fe", "--file-extensions"],
        description = ["comma-separated list of file-extensions to parse only those files (default: any)"],
        converter = [(FileExtensionConverter::class)],
        preprocessor = CommaSeparatedParameterPreprocessor::class
    )
    protected var fileExtensionsToAnalyse: List<String> = listOf()

    @CommandLine.Option(
        names = ["-bf", "--base-file"],
        description = ["base cc.json file with checksums to skip unchanged files during analysis"]
    )
    protected var baseFile: File? = null

    @CommandLine.Option(
        names = ["--bypass-gitignore"],
        description = ["bypass .gitignore files and use regex-based exclusion instead (default: false)"]
    )
    protected var bypassGitignore = false

    @CommandLine.Option(
        names = ["--local-changes"],
        description = ["only analyze files that differ from the remote tracking branch (uncommitted, staged, unstaged, untracked)"]
    )
    protected var localChanges = false

    @CommandLine.Option(
        names = ["--commit"],
        description = ["analyze the codebase at a specific git commit (creates a temporary worktree)"]
    )
    protected var commit: String? = null

    protected fun resolveEffectiveInput(inputFile: File): CommitAnalysisContext {
        val commitRef = commit?.trim()?.takeIf { it.isNotEmpty() }

        require(!(commitRef != null && localChanges)) {
            "--commit and --local-changes are mutually exclusive"
        }

        if (commitRef == null) return CommitAnalysisContext(inputFile, null, null)

        val repoRootPath = findGitRoot(inputFile).absoluteFile.toPath().normalize()
        val inputPath = inputFile.absoluteFile.toPath().normalize()
        require(inputPath.startsWith(repoRootPath)) {
            "Input path must be inside the git repository: $inputPath"
        }
        val relativePath = repoRootPath.relativize(inputPath)
        val manager = GitWorktreeManager(repoRootPath.toFile())
        val shortHash = manager.shortCommitHash(commitRef)
        val worktreeDir = manager.createWorktree(commitRef)
        val effectiveInput = File(worktreeDir, relativePath.toString())
        return CommitAnalysisContext(effectiveInput, manager, shortHash)
    }

    private fun findGitRoot(startDir: File): File {
        val absoluteStart = startDir.absoluteFile
        var dir = if (absoluteStart.isFile) absoluteStart.parentFile else absoluteStart
        while (dir != null) {
            if (File(dir, ".git").exists()) return dir
            dir = dir.parentFile
        }
        throw IllegalArgumentException("Not a git repository: ${absoluteStart.path}")
    }
}
