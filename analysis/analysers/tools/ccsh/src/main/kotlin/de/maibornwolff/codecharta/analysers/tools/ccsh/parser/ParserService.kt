package de.maibornwolff.codecharta.analysers.tools.ccsh.parser

import de.maibornwolff.codecharta.analysers.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.analysers.tools.interactiveparser.InteractiveParser
import de.maibornwolff.codecharta.analysers.tools.interactiveparser.runInTerminalSession
import picocli.CommandLine

class ParserService {
    companion object {
        fun getParserSuggestions(commandLine: CommandLine, parserRepository: PicocliParserRepository, inputFile: String): List<String> {
            val allParsers = parserRepository.getAllInteractiveParsers(commandLine)
            val usableParsers =
                parserRepository.getApplicableInteractiveParserNamesWithDescription(inputFile, allParsers)

            return usableParsers.ifEmpty { emptyList() }
        }

        fun configureParserSelection(
            commandLine: CommandLine,
            parserRepository: PicocliParserRepository,
            selectedParsers: List<String>
        ): Map<String, List<String>> {
            val configuredParsers = mutableMapOf<String, List<String>>()
            for (selectedParser in selectedParsers) {
                println(System.lineSeparator() + "Now configuring $selectedParser.")
                val interactiveParser = parserRepository.getInteractiveParser(commandLine, selectedParser)

                requireNotNull(interactiveParser) { "Tried to configure non existing parser!" }

                val configuration = runInTerminalSession { interactiveParser.getDialog().collectParserArgs(this) }

                configuredParsers[selectedParser] = configuration

                println("You can run the same command again by using the following command line arguments:")
                println("ccsh " + selectedParser + " " + configuration.joinToString(" ") { x -> '"' + x + '"' })
            }
            return configuredParsers
        }

        fun selectParser(commandLine: CommandLine, parserRepository: PicocliParserRepository): String {
            val interactiveParserNames = parserRepository.getInteractiveParserNamesWithDescription(commandLine)
            val selectedParser = runInTerminalSession { InteractiveDialog.askParserToExecute(this, interactiveParserNames) }
            return parserRepository.extractParserName(selectedParser)
        }

        fun executeSelectedParser(commandLine: CommandLine, selectedParser: String): Int {
            val subCommand = commandLine.subcommands.getValue(selectedParser)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as InteractiveParser
            val collectedArgs = runInTerminalSession { interactive.getDialog().collectParserArgs(this) }

            val subCommandLine = CommandLine(interactive)
            println("You can run the same command again by using the following command line arguments:")
            println("ccsh " + selectedParser + " " + collectedArgs.joinToString(" ") { x -> '"' + x + '"' })
            return subCommandLine.execute(*collectedArgs.toTypedArray())
        }

        fun executePreconfiguredParser(commandLine: CommandLine, configuredParser: Pair<String, List<String>>): Int {
            val subCommand = commandLine.subcommands.getValue(configuredParser.first)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as InteractiveParser
            val subCommandLine = CommandLine(interactive)
            return subCommandLine.execute(*configuredParser.second.toTypedArray())
        }
    }
}
