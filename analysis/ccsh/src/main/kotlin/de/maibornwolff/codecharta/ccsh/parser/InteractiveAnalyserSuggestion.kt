package de.maibornwolff.codecharta.ccsh.parser

import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.ccsh.Ccsh
import de.maibornwolff.codecharta.ccsh.parser.repository.PicocliAnalyserRepository
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File

class InteractiveAnalyserSuggestion {
    companion object {
        fun offerAndGetAnalyserSuggestionsAndConfigurations(commandLine: CommandLine): Map<String, List<String>> {
            val applicableAnalysers = getApplicableAnalyser(commandLine)

            if (applicableAnalysers.isEmpty()) {
                return emptyMap()
            }

            val analysers = selectToBeExecutedAnalyser(applicableAnalysers)

            return if (analysers.isEmpty()) {
                emptyMap()
            } else {
                val analyserRepository = PicocliAnalyserRepository()
                val selectedAnalysersWithoutDescription = analysers.map { analyserRepository.extractAnalyserName(it) }
                AnalyserService.configureAnalyserSelection(commandLine, analyserRepository, selectedAnalysersWithoutDescription)
            }
        }

        private fun getApplicableAnalyser(commandLine: CommandLine): List<String> {
            val inputFilePath: String = runInTerminalSession { InteractiveDialog.askForPath(this) }

            val inputFile = File(inputFilePath)
            if (inputFilePath == "" || !isInputFileOrDirectory(inputFile)) {
                Logger.error { "Specified invalid or empty path to analyze! Aborting..." }
                return emptyList()
            }

            val applicableAnalysers =
                AnalyserService.getAnalyserSuggestions(commandLine, PicocliAnalyserRepository(), inputFilePath)

            if (applicableAnalysers.isEmpty()) {
                Logger.info { Ccsh.NO_USABLE_ANALYSER_FOUND_MESSAGE }
                return emptyList()
            }

            return applicableAnalysers
        }

        private fun selectToBeExecutedAnalyser(applicableAnalysers: List<String>): List<String> {
            val selectedAnalysers: List<String> = runInTerminalSession {
                InteractiveDialog.askApplicableAnalyser(
                    this,
                    applicableAnalysers
                )
            }

            if (selectedAnalysers.isEmpty()) {
                Logger.info { "Did not select any analyser to be configured!" }
                return emptyList()
            }
            return selectedAnalysers
        }

        private fun isInputFileOrDirectory(inputFile: File): Boolean {
            return (inputFile.isDirectory || inputFile.isFile)
        }
    }
}
