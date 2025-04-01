package de.maibornwolff.codecharta.analysers.tools.ccsh.parser

import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.analysers.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.analysers.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File

class InteractiveAnalyserSuggestion {
    companion object {
        fun offerAndGetAnalyserSuggestionsAndConfigurations(commandLine: CommandLine): Map<String, List<String>> {
            val applicableParsers = getApplicableAnalyser(commandLine)

            if (applicableParsers.isEmpty()) {
                return emptyMap()
            }

            val selectedParsers = selectToBeExecutedAnalyser(applicableParsers)

            return if (selectedParsers.isEmpty()) {
                emptyMap()
            } else {
                val parserRepository = PicocliParserRepository()
                val selectedParsersWithoutDescription = selectedParsers.map { parserRepository.extractParserName(it) }
                ParserService.configureParserSelection(commandLine, parserRepository, selectedParsersWithoutDescription)
            }
        }

        private fun getApplicableAnalyser(commandLine: CommandLine): List<String> {
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

        private fun selectToBeExecutedAnalyser(applicableParsers: List<String>): List<String> {
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
