package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputPath: String = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )

            val configFile: String = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.JSON, FileExtension.YAML, FileExtension.YML),
                onInputReady = testCallback()
            )

            return listOf(inputPath, "--config", configFile)
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
