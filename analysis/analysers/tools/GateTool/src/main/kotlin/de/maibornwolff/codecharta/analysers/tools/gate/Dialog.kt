package de.maibornwolff.codecharta.analysers.tools.gate

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptList

class Dialog {
    companion object : AnalyserDialogInterface {
        private const val CHECK = "check the project"
        private const val INIT = "init: write a new config"
        private const val DOCTOR = "doctor: validate the config"
        private val SUBCOMMANDS = mapOf(INIT to "init", DOCTOR to "doctor")

        override fun collectAnalyserArgs(session: Session): List<String> {
            val action = session.promptList(
                message = "What do you want to do?",
                choices = listOf(CHECK, INIT, DOCTOR),
                onInputReady = testCallback()
            )
            val projectFolder = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FOLDER,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )
            return listOfNotNull(SUBCOMMANDS[action], projectFolder)
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
