package de.maibornwolff.codecharta.tools.ccsh.parser

import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
import picocli.CommandLine

class ParserService {
    companion object {
        internal const val EXIT_CODE_PARSER_NOT_SUPPORTED = 42

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

                val parserDialog = interactiveParser.getDialog()
                val configuration = parserDialog.startSession { parserDialog.collectParserArgs(this) }

                configuredParsers[selectedParser] = configuration

                println("You can run the same command again by using the following command line arguments:")
                println("ccsh " + selectedParser + " " + configuration.joinToString(" ") { x -> '"' + x + '"' })
            }
            return configuredParsers
        }

        fun selectParser(commandLine: CommandLine, parserRepository: PicocliParserRepository): String {
            val selectedParser = InteractiveDialog.callAskParserToExecute(
                parserRepository.getInteractiveParserNamesWithDescription(commandLine)
            )
            return parserRepository.extractParserName(selectedParser)
        }

        fun executeSelectedParser(commandLine: CommandLine, selectedParser: String): Int {
            val subCommand = commandLine.subcommands.getValue(selectedParser)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as? InteractiveParser
            return if (interactive != null) {
                val parserDialog = interactive.getDialog()
                val collectedArgs = parserDialog.startSession { parserDialog.collectParserArgs(this) }

                val subCommandLine = CommandLine(interactive)
                println("You can run the same command again by using the following command line arguments:")
                println("ccsh " + selectedParser + " " + collectedArgs.joinToString(" ") { x -> '"' + x + '"' })
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
                "The interactive usage of $parserName is not supported yet.\nPlease specify the full command to run the parser."
            )
        }
    }
}
