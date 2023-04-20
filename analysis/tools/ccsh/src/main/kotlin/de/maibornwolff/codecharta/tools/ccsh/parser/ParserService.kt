package de.maibornwolff.codecharta.tools.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptCheckbox
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import picocli.CommandLine

class ParserService {
    companion object {
        private const val EXIT_CODE_PARSER_NOT_SUPPORTED = 42

        fun offerParserSuggestions(commandLine: CommandLine, parserRepository: PicocliParserRepository, inputFile: String): List<String> {
            val allParsers = parserRepository.getAllParsers(commandLine)
            val usableParsers = parserRepository.getUsableParserNames(inputFile, allParsers)

            return if (usableParsers.isEmpty()) {
                emptyList()
            } else {
                KInquirer.promptCheckbox(
                        message = "Choose from this list of applicable parsers",
                        choices = usableParsers)
            }
        }

        fun configureParserSelection(commandLine: CommandLine, parserRepository: PicocliParserRepository, selectedParsers: List<String>): Map<String, List<String>> {
            val configuredParsers = mutableMapOf<String, List<String>>()
            for (selectedParser in selectedParsers) {
                val interactiveParser = parserRepository.getParser(commandLine, selectedParser)
                if (interactiveParser == null) {
                    throw IllegalArgumentException("Tried to configure non existing parser!")
                } else {
                    val configuration = interactiveParser.getDialog().collectParserArgs()
                    configuredParsers[selectedParser] = configuration

                    println("You can run the same command again by using the following command line arguments:")
                    println("ccsh " + selectedParser + " " + configuration.map { x -> '"' + x + '"' }.joinToString(" "))
                }
            }
            return configuredParsers
        }

        fun selectParser(commandLine: CommandLine, parserRepository: PicocliParserRepository): String {
            val selectedParser: String = KInquirer.promptList(
                message = "Which parser do you want to execute?",
                choices = parserRepository.getParserNamesWithDescription(commandLine)
            )
            return parserRepository.extractParserName(selectedParser)
        }

        fun executeSelectedParser(commandLine: CommandLine, selectedParser: String): Int {
            val subCommand = commandLine.subcommands.getValue(selectedParser)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as? InteractiveParser
            return if (interactive != null) {
                val collectedArgs = interactive.getDialog().collectParserArgs()
                val subCommandLine = CommandLine(interactive)
                println("You can run the same command again by using the following command line arguments:")
                println("ccsh " + selectedParser + " " + collectedArgs.map { x -> '"' + x + '"' }.joinToString(" "))
                subCommandLine.execute(*collectedArgs.toTypedArray())
            } else {
                printNotSupported(selectedParser)
                EXIT_CODE_PARSER_NOT_SUPPORTED
            }
        }

        fun executePreconfiguredParser(commandLine: CommandLine, configuredParser: Pair<String, List<String>>): Int {
            val subCommand = commandLine.subcommands.getValue(configuredParser.first)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as? InteractiveParser
            return if (interactive != null) {
                val subCommandLine = CommandLine(interactive)
                subCommandLine.execute(*configuredParser.second.toTypedArray())
            } else {
                printNotSupported(configuredParser.first)
                EXIT_CODE_PARSER_NOT_SUPPORTED
            }
        }

        private fun printNotSupported(parserName: String) {
            println(
                "The interactive usage of $parserName is not supported yet.\n" +
                        "Please specify the full command to run the parser."
            )
        }
    }
}
