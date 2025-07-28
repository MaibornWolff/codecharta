package de.maibornwolff.codecharta.analysers.analyserinterface

import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedParameterPreprocessor
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CommaSeparatedStringToListConverter
import de.maibornwolff.codecharta.analysers.analyserinterface.util.FileExtensionConverter
import picocli.CommandLine
import java.io.File

abstract class CommonAnalyserParameters {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    protected var help = false

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE or FOLDER", description = ["file/project to parse"])
    protected var inputFile: File? = null

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
    protected var patternsToExclude: List<String> = listOf()

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
}
