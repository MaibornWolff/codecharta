package de.maibornwolff.codecharta.analysers.analyserinterface.failures

import de.maibornwolff.codecharta.util.Logger
import picocli.CommandLine

/** The exit code of an analyser run: 0, or 1 once the run ends with an error instead of writing its output. */
class RunExitCode : CommandLine.IExitCodeGenerator {
    private var exitCode = SUCCEEDED

    override fun getExitCode(): Int = exitCode

    fun failWith(message: String) {
        Logger.error { message }
        exitCode = FAILED
    }

    private companion object {
        const val SUCCEEDED = 0
        const val FAILED = 1
    }
}
