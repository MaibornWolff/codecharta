package de.maibornwolff.codecharta.tools.ccsh.parser

import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.tools.interactiveparser.runInTerminalSession
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File

class InteractiveParserSuggestion {
    companion object {
        fun offerAndGetInteractiveParserSuggestionsAndConfigurations(commandLine: CommandLine): Map<String, List<String>> {
            val applicableParsers = getApplicableInteractiveParsers(commandLine)

            if (applicableParsers.isEmpty()) {
                return emptyMap()
            }

            val selectedParsers = selectToBeExecutedInteractiveParsers(applicableParsers)

            return if (selectedParsers.isEmpty()) {
                emptyMap()
            } else {
                val parserRepository = PicocliParserRepository()
                val selectedParsersWithoutDescription = selectedParsers.map { parserRepository.extractParserName(it) }
                ParserService.configureParserSelection(commandLine, parserRepository, selectedParsersWithoutDescription)
            }
        }

        private fun getApplicableInteractiveParsers(commandLine: CommandLine): List<String> {
            val inputFilePath: String = runInTerminalSession { InteractiveDialog.askForPath(this) }

            val inputFile = File(inputFilePath)
            if (inputFilePath == "" || !isInputFileOrDirectory(inputFile)) {
                Logger.error { "Specified invalid or empty path to analyze! Aborting..." }
                return emptyList()
            }

            val applicableParsers =
                ParserService.getParserSuggestions(commandLine, PicocliParserRepository(), inputFilePath)

            if (applicableParsers.isEmpty()) {
                Logger.info { Ccsh.NO_USABLE_PARSER_FOUND_MESSAGE }
                return emptyList()
            }

            return applicableParsers
        }

        private fun selectToBeExecutedInteractiveParsers(applicableParsers: List<String>): List<String> {
            val selectedParsers: List<String> = runInTerminalSession { InteractiveDialog.askApplicableParser(this, applicableParsers) }

            if (selectedParsers.isEmpty()) {
                Logger.info { "Did not select any parser to be configured!" }
                return emptyList()
            }
            return selectedParsers
        }

        private fun isInputFileOrDirectory(inputFile: File): Boolean {
            return (inputFile.isDirectory || inputFile.isFile)
        }
    }
}
