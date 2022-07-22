package de.maibornwolff.codecharta.tools.ccsh

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.filter.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.importer.crococosmo.CrococosmoImporter
import de.maibornwolff.codecharta.importer.csv.CSVImporter
import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser
import de.maibornwolff.codecharta.importer.jasome.JasomeImporter
import de.maibornwolff.codecharta.importer.metricgardener.MetricGardenerImporter
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.sourcemonitor.SourceMonitorImporter
import de.maibornwolff.codecharta.importer.svnlogparser.SVNLogParser
import de.maibornwolff.codecharta.importer.tokeiimporter.TokeiImporter
import de.maibornwolff.codecharta.importer.understand.UnderstandImporter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.tools.ccsh.parser.ParserService
import de.maibornwolff.codecharta.tools.validation.ValidationTool
import mu.KotlinLogging
import picocli.CommandLine
import java.util.concurrent.Callable

@CommandLine.Command(
    name = "ccsh",
    description = ["Command Line Interface for CodeCharta analysis"],
    subcommands = [
        ValidationTool::class,
        MergeFilter::class,
        EdgeFilter::class,
        StructureModifier::class,
        CSVImporter::class,
        SonarImporterMain::class,
        SourceMonitorImporter::class,
        SVNLogParser::class,
        GitLogParser::class,
        Installer::class,
        CSVExporter::class,
        CrococosmoImporter::class,
        SourceCodeParserMain::class,
        UnderstandImporter::class,
        CodeMaatImporter::class,
        JasomeImporter::class,
        TokeiImporter::class,
        RawTextParser::class
    ],
    versionProvider = Ccsh.ManifestVersionProvider::class,
    footer = ["Copyright(c) 2022, MaibornWolff GmbH"]
)

class Ccsh : Callable<Void?> {

    @CommandLine.Option(
        names = ["-v", "--version"],
        versionHelp = true,
        description = ["prints version info and exits"]
    )
    var versionRequested: Boolean = false

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exit"])
    var help: Boolean = false

    override fun call(): Void? {
        // info: always run

        return null
    }

    companion object {
        private val logger = KotlinLogging.logger {}

        @JvmStatic
        fun main(args: Array<String>) {
            val commandLine = CommandLine(Ccsh())
            commandLine.executionStrategy = CommandLine.RunAll()
            if (args.isEmpty() || isParserUnknown(args, commandLine)) {
                executeInteractiveParser(commandLine)
            } else {
                commandLine.execute(*sanitizeArgs(args))
            }
        }

        private fun executeInteractiveParser(commandLine: CommandLine) {
            val selectedParser = ParserService.selectParser(commandLine)
            logger.info { "Executing $selectedParser" }
            ParserService.executeSelectedParser(commandLine, selectedParser)
        }

        private fun isParserUnknown(args: Array<String>, commandLine: CommandLine): Boolean {
            if (args.isNotEmpty()) {
                val firstArg = args.first()
                val parserList = commandLine.subcommands.keys
                val optionsList = commandLine.commandSpec.options().map { it.names().toMutableList() }.flatten()
                return !parserList.contains(firstArg) && !optionsList.contains(firstArg)
            }
            return false
        }

        private fun sanitizeArgs(args: Array<String>): Array<String> {
            return args.map { argument ->
                var sanitizedArg = ""
                if (argument.length > 1 && argument.substring(0, 2) == ("--")) {
                    var skip = false
                    argument.forEach {
                        if (it == '=') skip = true
                        if (it.isUpperCase() && !skip) sanitizedArg += "-" + it.lowercaseChar()
                        else sanitizedArg += it
                    }
                } else {
                    sanitizedArg = argument
                }
                return@map sanitizedArg
            }.toTypedArray()
        }
    }

    object ManifestVersionProvider : CommandLine.IVersionProvider {
        override fun getVersion(): Array<String> {
            return arrayOf(
                Ccsh::class.java.`package`.implementationTitle + "\n" +
                    "version \"" + Ccsh::class.java.`package`.implementationVersion + "\"\n" +
                    "Copyright(c) 2022, MaibornWolff GmbH"
            )
        }
    }
}

@CommandLine.Command(name = "install", description = ["[deprecated]: does nothing"])
class Installer : Callable<Void?> {

    override fun call(): Void? {
        println("[deprecated]: does nothing")
        return null
    }
}
