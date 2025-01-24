package de.maibornwolff.codecharta.tools.ccsh.parser

import com.varabyte.kotter.foundation.session
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File
import java.nio.file.Paths

class InteractiveParserSuggestionDialog {
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
            var inputFilePath: String = ""
            println("You can provide a directory path / file path / sonar url.")
            session {
                inputFilePath = myPromptInput(
                    message = "Which path should be scanned?",
                    hint = Paths.get("").toAbsolutePath().toString(),
                    allowEmptyInput = false,
                    onInputReady = {}
                )
            }

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
            var selectedParsers: List<String> = listOf()
            session {
                selectedParsers = myPromptCheckbox(
                    message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                    choices = applicableParsers,
                    allowEmptyInput = true,
                    onInputReady = {}
                )
            }

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
