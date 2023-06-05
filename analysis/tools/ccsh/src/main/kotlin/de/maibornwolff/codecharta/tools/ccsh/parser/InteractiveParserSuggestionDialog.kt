package de.maibornwolff.codecharta.tools.ccsh.parser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptCheckbox
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.ccsh.Ccsh
import de.maibornwolff.codecharta.tools.ccsh.parser.repository.PicocliParserRepository
import mu.KotlinLogging
import picocli.CommandLine

class InteractiveParserSuggestionDialog {
    companion object {
        private val logger = KotlinLogging.logger {}

        fun offerAndGetInteractiveParserSuggestionsAndConfigurations(commandLine: CommandLine): Map<String, List<String>> {
            val applicableParsers = getApplicableInteractiveParsers(commandLine)

            if (applicableParsers.isEmpty()) {
                return emptyMap()
            }

            val selectedParsers = selectToBeExecutedInteractiveParsers(applicableParsers)

            return if (selectedParsers.isEmpty()) {
                emptyMap()
            } else {
                ParserService.configureParserSelection(commandLine, PicocliParserRepository(), selectedParsers)
            }
        }

        private fun getApplicableInteractiveParsers(commandLine: CommandLine): List<String> {
            val inputFile: String = KInquirer.promptInput(
                    message = "Which path should be scanned?",
                    hint = "You can provide a directory path / file path / sonar url.")

            val applicableParsers =
                    ParserService.getParserSuggestions(commandLine, PicocliParserRepository(), inputFile)

            if (applicableParsers.isEmpty()) {
                logger.info(Ccsh.NO_USABLE_PARSER_FOUND_MESSAGE)
                return emptyList()
            }

            return applicableParsers
        }

        private fun selectToBeExecutedInteractiveParsers(applicableParsers: List<String>): List<String> {
            val selectedParsers = KInquirer.promptCheckbox(
                    message = "Choose from this list of applicable parsers. You can select individual parsers by pressing spacebar.",
                    choices = applicableParsers)

            if (selectedParsers.isEmpty()) {
                logger.info("Did not select any parser to be configured!")
                return emptyList()
            }
            return selectedParsers
        }
    }
}
