package de.maibornwolff.codecharta.analysers.analyserinterface

import de.maibornwolff.codecharta.util.CodeChartaConstants
import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.util.concurrent.Callable

interface AnalyserInterface : Callable<Unit?> {
    val name: String
    val description: String

    fun getDialog(): AnalyserDialogInterface

    fun isApplicable(resourceToBeParsed: String): Boolean

    fun getAnalyserName(): String {
        return name
    }

    fun getAnalyserDescription(): String {
        return description
    }

    fun logExecutionStartedSyncSignal() {
        print(CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG)
    }

    fun shouldProcessPipedInput(allInputFiles: List<File>): Boolean {
        val isInVirtualConsole = System.console() == null
        val inputFilesContainPipedFlag = allInputFiles.any { it.toString() == "-" }

        if (!inputFilesContainPipedFlag) return false
        if (!isInVirtualConsole) {
            Logger.warn { "Flag for piped input specified but command is not executed in a pipe, ignoring piped input..." }
            return false
        }
        return true
    }

    fun extractNonPipedInputIndex(allInputFiles: List<File>): Int {
        if (allInputFiles.isEmpty()) return -1

        val nonPipedFileIndices = allInputFiles
            .mapIndexed { index, file -> if (file.toString() != "-") index else null }
            .filterNotNull()

        require(nonPipedFileIndices.isNotEmpty()) { "No input file/folder detected, stopping execution..." }
        require(nonPipedFileIndices.size == 1) { "Multiple input files/folders detected, stopping execution..." }

        return nonPipedFileIndices.first()
    }
}
