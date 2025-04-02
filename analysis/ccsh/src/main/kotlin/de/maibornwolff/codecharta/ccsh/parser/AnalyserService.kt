package de.maibornwolff.codecharta.ccsh.parser

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.ccsh.parser.repository.PicocliAnalyserRepository
import picocli.CommandLine

class AnalyserService {
    companion object {
        fun getAnalyserSuggestions(
            commandLine: CommandLine,
            analyserRepository: PicocliAnalyserRepository,
            inputFile: String
        ): List<String> {
            val allAnalysers = analyserRepository.getAllAnalyserInterfaces(commandLine)
            val usableAnalysers =
                analyserRepository.getApplicableAnalyserNamesWithDescription(inputFile, allAnalysers)

            return usableAnalysers.ifEmpty { emptyList() }
        }

        fun configureAnalyserSelection(
            commandLine: CommandLine,
            analyserRepository: PicocliAnalyserRepository,
            selectedAnalysers: List<String>
        ): Map<String, List<String>> {
            val configuredAnalysers = mutableMapOf<String, List<String>>()
            for (selectedAnalyser in selectedAnalysers) {
                println(System.lineSeparator() + "Now configuring $selectedAnalyser.")
                val analyserInterface = analyserRepository.getAnalyserInterface(commandLine, selectedAnalyser)

                requireNotNull(analyserInterface) { "Tried to configure non existing analyser!" }

                val configuration = runInTerminalSession { analyserInterface.getDialog().collectAnalyserArgs(this) }

                configuredAnalysers[selectedAnalyser] = configuration

                println("You can run the same command again by using the following command line arguments:")
                println("ccsh " + selectedAnalyser + " " + configuration.joinToString(" ") { x -> '"' + x + '"' })
            }
            return configuredAnalysers
        }

        fun selectAnalyser(commandLine: CommandLine, analyserRepository: PicocliAnalyserRepository): String {
            val analyserInterfaceNames = analyserRepository.getAnalyserInterfaceNamesWithDescription(commandLine)
            val selectedAnalyser = runInTerminalSession {
                InteractiveDialog.askAnalyserToExecute(
                    this,
                    analyserInterfaceNames
                )
            }
            return analyserRepository.extractAnalyserName(selectedAnalyser)
        }

        fun executeSelectedAnalyser(commandLine: CommandLine, selectedAnalyser: String): Int {
            val subCommand = commandLine.subcommands.getValue(selectedAnalyser)
            val analyserObject = subCommand.commandSpec.userObject()
            val interactive = analyserObject as AnalyserInterface
            val collectedArgs = runInTerminalSession { interactive.getDialog().collectAnalyserArgs(this) }

            val subCommandLine = CommandLine(interactive)
            println("You can run the same command again by using the following command line arguments:")
            println("ccsh " + selectedAnalyser + " " + collectedArgs.joinToString(" ") { x -> '"' + x + '"' })
            return subCommandLine.execute(*collectedArgs.toTypedArray())
        }

        fun executePreconfiguredAnalyser(commandLine: CommandLine, configuredAnalyser: Pair<String, List<String>>): Int {
            val subCommand = commandLine.subcommands.getValue(configuredAnalyser.first)
            val analyserObject = subCommand.commandSpec.userObject()
            val interactive = analyserObject as AnalyserInterface
            val subCommandLine = CommandLine(interactive)
            return subCommandLine.execute(*configuredAnalyser.second.toTypedArray())
        }
    }
}
