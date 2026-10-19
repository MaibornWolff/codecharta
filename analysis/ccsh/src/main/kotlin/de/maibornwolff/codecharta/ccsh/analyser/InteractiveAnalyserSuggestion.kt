package de.maibornwolff.codecharta.ccsh.analyser

import de.maibornwolff.codecharta.analysers.analyserinterface.runInTerminalSession
import de.maibornwolff.codecharta.analysers.tools.analyse.AnalyseTool
import de.maibornwolff.codecharta.ccsh.analyser.repository.PicocliAnalyserRepository
import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine
import java.io.File

class InteractiveAnalyserSuggestion {
    companion object {
        const val NO_USABLE_ANALYSER_FOUND_MESSAGE = "No usable analyser was found for the input file path!"

        fun offerAndGetAnalyserSuggestionsAndConfigurations(commandLine: CommandLine): Map<String, List<String>> {
            val inputFilePath = askForInputPath() ?: return emptyMap()
            if (wantsToAnalyseEverything(inputFilePath)) return analyseEverything(inputFilePath)

            val applicableAnalysers = getApplicableAnalyser(commandLine, inputFilePath)

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

        private fun askForInputPath(): String? {
            val inputFilePath: String = runInTerminalSession { InteractiveDialog.askForPath(this) }
            if (inputFilePath == "" || !isInputFileOrDirectory(File(inputFilePath))) {
                Logger.error { "Specified invalid or empty path to analyze! Aborting..." }
                return null
            }
            return inputFilePath
        }

        private fun wantsToAnalyseEverything(inputFilePath: String): Boolean =
            File(inputFilePath).isDirectory && runInTerminalSession { InteractiveDialog.askAnalyseEverything(this, inputFilePath) }

        private fun analyseEverything(inputFilePath: String): Map<String, List<String>> {
            println("You can run the same command again by using the following command line arguments:")
            println("ccsh ${AnalyseTool.NAME} \"$inputFilePath\"")
            return mapOf(AnalyseTool.NAME to listOf(inputFilePath))
        }

        private fun getApplicableAnalyser(commandLine: CommandLine, inputFilePath: String): List<String> {
            val applicableAnalysers =
                AnalyserService.getAnalyserSuggestions(commandLine, PicocliAnalyserRepository(), inputFilePath)

            if (applicableAnalysers.isEmpty()) {
                Logger.info { NO_USABLE_ANALYSER_FOUND_MESSAGE }
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

        private fun isInputFileOrDirectory(inputFile: File): Boolean = (inputFile.isDirectory || inputFile.isFile)
    }
}
