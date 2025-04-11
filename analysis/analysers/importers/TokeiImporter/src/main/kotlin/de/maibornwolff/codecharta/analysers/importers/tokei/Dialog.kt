package de.maibornwolff.codecharta.analysers.importers.tokei

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName: String = session.promptDefaultFileFolderInput(
                InputType.FILE,
                listOf(FileExtension.JSON),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                hint = "output.cc.json",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val rootName = session.promptInput(
                message = "Which root folder was specified when executing tokei?",
                hint = ".",
                allowEmptyInput = false,
                onInputReady = testCallback()
            )

            var pathSeparator = session.promptInput(
                message = "Which path separator is used? Leave empty for auto-detection",
                hint = "",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            if (pathSeparator == "\\") pathSeparator = "\\\\"

            val isCompressed = (outputFileName.isEmpty()) || session.promptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--root-name=$rootName",
                "--path-separator=$pathSeparator",
                if (isCompressed) null else "--not-compressed"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
