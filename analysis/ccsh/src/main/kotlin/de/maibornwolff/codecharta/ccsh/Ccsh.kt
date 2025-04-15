package de.maibornwolff.codecharta.ccsh

import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import de.maibornwolff.codecharta.analysers.exporters.csv.CSVExporter
import de.maibornwolff.codecharta.analysers.filters.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.analysers.filters.mergefilter.MergeFilter
import de.maibornwolff.codecharta.analysers.filters.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.analysers.importers.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.analysers.importers.coverage.CoverageImporter
import de.maibornwolff.codecharta.analysers.importers.csv.CSVImporter
import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporter
import de.maibornwolff.codecharta.analysers.importers.sourcemonitor.SourceMonitorImporter
import de.maibornwolff.codecharta.analysers.importers.tokei.TokeiImporter
import de.maibornwolff.codecharta.analysers.parsers.gitlog.GitLogParser
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.SourceCodeParser
import de.maibornwolff.codecharta.analysers.parsers.svnlog.SVNLogParser
import de.maibornwolff.codecharta.analysers.tools.inspection.InspectionTool
import de.maibornwolff.codecharta.analysers.tools.validation.ValidationTool
import de.maibornwolff.codecharta.ccsh.analyser.AnalyserService
import de.maibornwolff.codecharta.ccsh.analyser.InteractiveAnalyserSuggestion
import de.maibornwolff.codecharta.ccsh.analyser.InteractiveDialog
import de.maibornwolff.codecharta.ccsh.analyser.repository.PicocliAnalyserRepository
import de.maibornwolff.codecharta.util.AttributeGeneratorRegistry
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import kotlin.math.min
import kotlin.system.exitProcess

@CommandLine.Command(
    name = "ccsh",
    description = ["Command Line Interface for CodeCharta analysis"],
    subcommands = [
        ValidationTool::class,
        InspectionTool::class,
        MergeFilter::class,
        EdgeFilter::class,
        StructureModifier::class,
        CSVImporter::class,
        SonarImporter::class,
        SourceMonitorImporter::class,
        SVNLogParser::class,
        GitLogParser::class,
        Installer::class,
        CSVExporter::class,
        SourceCodeParser::class,
        CoverageImporter::class,
        CodeMaatImporter::class,
        TokeiImporter::class,
        RawTextParser::class
    ],
    versionProvider = Ccsh.ManifestVersionProvider::class,
    footer = [CodeChartaConstants.GENERIC_FOOTER]
)
class Ccsh : Callable<Unit?> {
    @CommandLine.Option(
        names = ["-v", "--version"],
        versionHelp = true,
        description = ["prints version info and exits"]
    )
    var versionRequested: Boolean = false

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exit"])
    var help: Boolean = false

    @CommandLine.Option(names = ["-i", "--interactive"], description = ["starts interactive analyser"])
    var shouldUseInteractiveShell: Boolean = false

    override fun call(): Unit? { // info: always run

        return null
    }

    companion object {
        const val NO_USABLE_ANALYSER_FOUND_MESSAGE = "No usable analyser was found for the input file path!"

        @JvmStatic
        fun main(args: Array<String>) {
            registerAllAttributeGenerators()
            exitProcess(executeCommandLine(args))
        }

        fun executeCommandLine(args: Array<String>): Int {
            val commandLine = CommandLine(Ccsh())
            commandLine.executionStrategy = CommandLine.RunAll()
            return when {
                args.isEmpty() -> executeAnalyserSuggestions(commandLine)
                (
                    !isAnalyserKnown(args, commandLine) && !isCommandKnown(args, commandLine) ||
                        args.contains(
                            "--interactive"
                        ) || args.contains("-i")
                ) -> selectAndExecuteAnalyser(commandLine)

                isAnalyserKnownButWithoutArgs(args, commandLine) -> executeAnalyser(args.first(), commandLine)
                else -> commandLine.execute(*sanitizeArgs(args))
            }
        }

        private fun executeAnalyserSuggestions(commandLine: CommandLine): Int {
            val configuredAnalysers =
                InteractiveAnalyserSuggestion.offerAndGetAnalyserSuggestionsAndConfigurations(
                    commandLine
                )
            if (configuredAnalysers.isEmpty()) {
                return 0
            }

            val shouldRunConfiguredAnalysers = runInTerminalSession { InteractiveDialog.askRunAnalysers(this) }

            return if (shouldRunConfiguredAnalysers) {
                executeConfiguredAnalysers(commandLine, configuredAnalysers)
            } else {
                0
            }
        }

        fun executeConfiguredAnalysers(commandLine: CommandLine, configuredAnalysers: Map<String, List<String>>): Int {
            val exitCode = AtomicInteger(0)
            val numberOfThreadsToBeStarted = min(configuredAnalysers.size, Runtime.getRuntime().availableProcessors())
            val threadPool = Executors.newFixedThreadPool(numberOfThreadsToBeStarted)
            for (configuredAnalyser in configuredAnalysers) {
                threadPool.execute {
                    val currentExitCode = executeConfiguredAnalyser(commandLine, configuredAnalyser)
                    if (currentExitCode != 0) {
                        exitCode.set(currentExitCode)
                        Logger.info { "Code: $currentExitCode" }
                    }
                }
            }
            threadPool.shutdown()
            threadPool.awaitTermination(1, TimeUnit.DAYS)

            val finalExitCode = exitCode.get()
            Logger.info { "Code: $finalExitCode" }
            if (finalExitCode != 0) {
                return finalExitCode
            } // Improvement: Try to extract merge commands before so user does not have to configure merge args?
            if (configuredAnalysers.size == 1) {
                Logger.info { "Analyser was successfully executed." }
                return 0
            }

            Logger.info { "Each analyser was successfully executed." }
            return askAndMergeResults(commandLine)
        }

        private fun askAndMergeResults(commandLine: CommandLine): Int {
            val shouldMerge = runInTerminalSession { InteractiveDialog.askForMerge(this) }
            var ccJsonFilePath = ""

            if (shouldMerge) {
                ccJsonFilePath = runInTerminalSession { InteractiveDialog.askJsonPath(this) }
            }

            return if (shouldMerge) {
                val outputFilePath =
                    "$ccJsonFilePath/mergedResult.cc.json" // Default args with input path being the output path as well
                val mergeArguments =
                    listOf(
                        ccJsonFilePath,
                        "--output-file=$outputFilePath",
                        "--not-compressed=true",
                        "--add-missing=false",
                        "--recursive=true",
                        "--leaf=false",
                        "--ignore-case=false"
                    )

                val map = mapOf(MergeFilter.NAME to mergeArguments)
                executeConfiguredAnalyser(commandLine, map.entries.first())
            } else {
                0
            }
        }

        private fun executeConfiguredAnalyser(commandLine: CommandLine, configuredAnalyser: Map.Entry<String, List<String>>): Int {
            Logger.info { "Executing ${configuredAnalyser.key}" }
            val exitCode =
                AnalyserService.executePreconfiguredAnalyser(
                    commandLine,
                    Pair(configuredAnalyser.key, configuredAnalyser.value)
                )

            if (exitCode != 0) {
                Logger.info { "Error executing ${configuredAnalyser.key}, code $exitCode" }
            }

            return exitCode
        }

        private fun selectAndExecuteAnalyser(commandLine: CommandLine): Int {
            val selectedAnalyser = AnalyserService.selectAnalyser(commandLine, PicocliAnalyserRepository())
            return executeAnalyser(selectedAnalyser, commandLine)
        }

        private fun executeAnalyser(selectedAnalyser: String, commandLine: CommandLine): Int {
            Logger.info { "Executing $selectedAnalyser" }
            return AnalyserService.executeSelectedAnalyser(commandLine, selectedAnalyser)
        }

        private fun isAnalyserKnown(args: Array<String>, commandLine: CommandLine): Boolean {
            val firstArg = args.first()
            val analyserList: Set<String> = commandLine.subcommands.keys
            return analyserList.contains(firstArg)
        }

        private fun isCommandKnown(args: Array<String>, commandLine: CommandLine): Boolean {
            val firstArg = args.first()
            val optionsList = commandLine.commandSpec.options().map { it.names().toMutableList() }.flatten()
            return optionsList.contains(firstArg)
        }

        private fun isAnalyserKnownButWithoutArgs(args: Array<String>, commandLine: CommandLine): Boolean {
            return isAnalyserKnown(args, commandLine) && args.size == 1
        }

        private fun sanitizeArgs(args: Array<String>): Array<String> {
            return args.map { argument ->
                var sanitizedArg = ""
                if (argument.length > 1 && argument.substring(0, 2) == ("--")) {
                    var skip = false
                    argument.forEach {
                        if (it == '=') skip = true
                        if (it.isUpperCase() && !skip) {
                            sanitizedArg += "-" + it.lowercaseChar()
                        } else {
                            sanitizedArg += it
                        }
                    }
                } else {
                    sanitizedArg = argument
                }
                return@map sanitizedArg
            }.toTypedArray()
        }

        private fun registerAllAttributeGenerators() {
            AttributeGeneratorRegistry.registerGenerator(RawTextParser())
            AttributeGeneratorRegistry.registerGenerator(CodeMaatImporter())
            AttributeGeneratorRegistry.registerGenerator(CSVImporter())
            AttributeGeneratorRegistry.registerGenerator(GitLogParser())
            AttributeGeneratorRegistry.registerGenerator(SonarImporter())
            AttributeGeneratorRegistry.registerGenerator(SourceCodeParser())
            AttributeGeneratorRegistry.registerGenerator(CoverageImporter())
            AttributeGeneratorRegistry.registerGenerator(SVNLogParser())
            AttributeGeneratorRegistry.registerGenerator(TokeiImporter())
            AttributeGeneratorRegistry.registerGenerator(SourceMonitorImporter())
        }
    }

    @SuppressWarnings("kotlin:S6516") // Not possible to use a lambda here, because picocli expects a class type
    object ManifestVersionProvider : CommandLine.IVersionProvider {
        override fun getVersion(): Array<String> {
            return arrayOf(
                Ccsh::class.java.`package`.implementationTitle + "\n" +
                    "version \"" + Ccsh::class.java.`package`.implementationVersion + "\"\n" +
                    "Copyright(c) 2024, MaibornWolff GmbH"
            )
        }
    }
}

@CommandLine.Command(name = "install", description = ["[deprecated]: does nothing"])
class Installer : Callable<Unit?> {
    override fun call(): Unit? {
        println("[deprecated]: does nothing")
        return null
    }
}
