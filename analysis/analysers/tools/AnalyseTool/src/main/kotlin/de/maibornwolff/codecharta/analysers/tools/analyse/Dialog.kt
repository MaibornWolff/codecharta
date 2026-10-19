package de.maibornwolff.codecharta.analysers.tools.analyse

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val projectFolder = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FOLDER,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )
            val outputFile = session.promptInput(
                message = "What is the name of the output file?",
                hint = "leave empty for <folder name>.cc.json.gz in the current folder",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            val exclude = session.promptInput(
                message = "Do you want to exclude files or folders by regex pattern?",
                hint = "regex1, regex2.. (leave empty to exclude nothing)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            return listOfNotNull(
                projectFolder,
                outputFile.ifBlank { null }?.let { "--output-file=$it" },
                exclude.ifBlank { null }?.let { "--exclude=$it" }
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
