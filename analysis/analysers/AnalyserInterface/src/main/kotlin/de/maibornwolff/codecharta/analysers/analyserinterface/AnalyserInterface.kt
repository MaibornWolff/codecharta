package de.maibornwolff.codecharta.analysers.analyserinterface

import de.maibornwolff.codecharta.analysers.analyserinterface.util.CodeChartaConstants
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

    // print 12 invisible characters so signal to other parsers that execution has started
    fun logExecutionStartedSyncSignal() {
        print(CodeChartaConstants.EXECUTION_STARTED_SYNC_FLAG)
    }
}
