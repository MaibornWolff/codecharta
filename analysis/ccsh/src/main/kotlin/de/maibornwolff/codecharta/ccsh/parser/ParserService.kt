package de.maibornwolff.codecharta.ccsh.parser

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.ccsh.parser.repository.PicocliParserRepository
import picocli.CommandLine

class ParserService {
    companion object {
        fun getParserSuggestions(commandLine: CommandLine, parserRepository: PicocliParserRepository, inputFile: String): List<String> {
            val allParsers = parserRepository.getAllAnalyserInterfaces(commandLine)
            val usableParsers =
                parserRepository.getApplicableAnalyserNamesWithDescription(inputFile, allParsers)

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
                val analyserInterface = parserRepository.getAnalyserInterface(commandLine, selectedParser)

                requireNotNull(analyserInterface) { "Tried to configure non existing parser!" }

                val configuration = runInTerminalSession { analyserInterface.getDialog().collectParserArgs(this) }

                configuredParsers[selectedParser] = configuration

                println("You can run the same command again by using the following command line arguments:")
                println("ccsh " + selectedParser + " " + configuration.joinToString(" ") { x -> '"' + x + '"' })
            }
            return configuredParsers
        }

        fun selectParser(commandLine: CommandLine, parserRepository: PicocliParserRepository): String {
            val analyserInterfaceNames = parserRepository.getAnalyserInterfaceNamesWithDescription(commandLine)
            val selectedParser = runInTerminalSession {
                InteractiveDialog.askParserToExecute(
                    this,
                    analyserInterfaceNames
                )
            }
            return parserRepository.extractParserName(selectedParser)
        }

        fun executeSelectedParser(commandLine: CommandLine, selectedParser: String): Int {
            val subCommand = commandLine.subcommands.getValue(selectedParser)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as AnalyserInterface
            val collectedArgs = runInTerminalSession { interactive.getDialog().collectParserArgs(this) }

            val subCommandLine = CommandLine(interactive)
            println("You can run the same command again by using the following command line arguments:")
            println("ccsh " + selectedParser + " " + collectedArgs.joinToString(" ") { x -> '"' + x + '"' })
            return subCommandLine.execute(*collectedArgs.toTypedArray())
        }

        fun executePreconfiguredParser(commandLine: CommandLine, configuredParser: Pair<String, List<String>>): Int {
            val subCommand = commandLine.subcommands.getValue(configuredParser.first)
            val parserObject = subCommand.commandSpec.userObject()
            val interactive = parserObject as AnalyserInterface
            val subCommandLine = CommandLine(interactive)
            return subCommandLine.execute(*configuredParser.second.toTypedArray())
        }
    }
}
