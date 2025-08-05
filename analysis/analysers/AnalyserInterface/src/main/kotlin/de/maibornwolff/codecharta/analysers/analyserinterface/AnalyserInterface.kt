package de.maibornwolff.codecharta.analysers.analyserinterface

import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
import java.io.PrintStream
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

    fun logExecutionStartedSyncSignal(out: PrintStream) {
        out.print(CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG)
    }
}
