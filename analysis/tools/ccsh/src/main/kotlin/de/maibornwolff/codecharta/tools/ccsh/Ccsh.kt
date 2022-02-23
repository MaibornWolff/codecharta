package de.maibornwolff.codecharta.tools.ccsh

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.filter.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.importer.crococosmo.CrococosmoImporter
import de.maibornwolff.codecharta.importer.csv.CSVImporter
import de.maibornwolff.codecharta.importer.csv.SourceMonitorImporter
import de.maibornwolff.codecharta.importer.jasome.JasomeImporter
import de.maibornwolff.codecharta.importer.scmlogparser.SCMLogParser
import de.maibornwolff.codecharta.importer.scmlogparserv2.SCMLogParserV2
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.tokeiimporter.TokeiImporter
import de.maibornwolff.codecharta.importer.understand.UnderstandImporter
import de.maibornwolff.codecharta.parser.rawtextparser.RawTextParser
import de.maibornwolff.codecharta.tools.validation.ValidationTool
import picocli.AutoComplete
import picocli.CommandLine
import java.io.File
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
            SCMLogParser::class,
            SCMLogParserV2::class,
            Installer::class,
            CSVExporter::class,
            CrococosmoImporter::class,
            SourceCodeParserMain::class,
            UnderstandImporter::class,
            CodeMaatImporter::class,
            JasomeImporter::class,
            TokeiImporter::class,
            RawTextParser::class,
            AutoComplete.GenerateCompletion::class
        ],
        versionProvider = Ccsh.ManifestVersionProvider::class,
        footer = ["Copyright(c) 2020, MaibornWolff GmbH"]
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
        @JvmStatic
        fun main(args: Array<String>) {
            val commandLine = CommandLine(Ccsh())

            commandLine.parseWithHandler(CommandLine.RunAll(), System.out, *sanitizeArgs(args))

            var subcommandNames = commandLine.subcommands.keys.toString()

            if( (args.isNotEmpty() && !subcommandNames.contains(args[0])) || args.isEmpty()) {
                var subcommand = selectParser(commandLine)
                println("executing $subcommand")
            }
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

        private fun selectParser(commandLine: CommandLine): String {
            println("Which parser do you want to execute?")

            var listOfParsers = getListOfParsers(commandLine)
            var index = 1

            for ((name, description) in listOfParsers) {
                var position = index++
                println("$position) $name - $description")
            }

            var inputParser = readLine().toString()

            var listLength = listOfParsers.size

            while (isLetter(inputParser) || isSpecialCharacter(inputParser) || !isNumberRange(inputParser)) {
                println("The input is invalid. Enter a valid number from 1 to $listLength.")
                inputParser = readLine().toString()
            }

            var selectedParserNumber = inputParser.toInt()

            return commandLine.subcommands.keys.elementAt(selectedParserNumber!! - 1)
        }

        private fun getListOfParsers(commandLine: CommandLine): MutableMap<String, String> {
            var subcommands = commandLine.subcommands.values
            var listOfParsers = mutableMapOf<String, String>()
            var commandName: String

            for (command in subcommands) {
                commandName = command.commandName
                var commandDescription = command.commandSpec.usageMessage().description()

                for (description in commandDescription) {
                    listOfParsers[commandName] = description
                }
            }
            return listOfParsers
        }

        private fun isLetter(input: String): Boolean {
            return input.matches("^[a-zA-Z]*$".toRegex())
        }

        private fun isSpecialCharacter(input: String): Boolean {
            return input.matches("[!@#$%&*()_+=|<>?{}\\[\\]~-]".toRegex())
        }

        private fun isNumberRange(input: String): Boolean {
            return input.matches("^[1-9]|1[0-7]*$".toRegex())
        }
    }

    object ManifestVersionProvider : CommandLine.IVersionProvider {
        override fun getVersion(): Array<String> {
            return arrayOf(
                    Ccsh::class.java.`package`.implementationTitle + "\n" +
                            "version \"" + Ccsh::class.java.`package`.implementationVersion + "\"\n" +
                            "Copyright(c) 2020, MaibornWolff GmbH"
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
