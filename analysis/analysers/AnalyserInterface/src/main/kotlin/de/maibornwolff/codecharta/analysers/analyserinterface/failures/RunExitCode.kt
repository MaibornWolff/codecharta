package de.maibornwolff.codecharta.analysers.analyserinterface.failures

import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine

/** An analyser run that can end with an error instead of writing its output, and that tells why it did. */
interface FailableRun : CommandLine.IExitCodeGenerator {
    /** Why the run ended with an error, null for a run that did not. */
    val failureMessage: String?
}

/** The exit code of an analyser run: 0, or 1 once the run ends with an error instead of writing its output. */
class RunExitCode : FailableRun {
    private var exitCode = SUCCEEDED

    override var failureMessage: String? = null
        private set

    override fun getExitCode(): Int = exitCode

    fun failWith(message: String) {
        Logger.error { message }
        failureMessage = message
        exitCode = FAILED
    }

    private companion object {
        const val SUCCEEDED = 0
        const val FAILED = 1
    }
}
