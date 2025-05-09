package de.maibornwolff.codecharta.analysers.importers.coverage

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptList
import java.util.Locale

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val formatChoice: String = session.promptList(
                message = "Specify the format of the coverage report",
                choices = getFormatNames(),
                onInputReady = testCallback()
            ).lowercase(Locale.getDefault())

            val format = getFormatByName(formatChoice)

            val reportFile: String = session.promptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(format.fileExtension),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                hint = "coverage.cc.json",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed = (outputFileName.isEmpty()) || session.promptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            val keepLeadingPaths = session.promptConfirm(
                message = "Do you want to cut leading file paths segments that come before the project root directory?",
                onInputReady = testCallback()
            )

            val formatParam = "--format=${format.formatName}"
            val outputFileParam = if (outputFileName.isNotEmpty()) "--output-file=$outputFileName" else null
            val notCompressedParam = if (isCompressed) null else "--not-compressed"
            val keepLeadingPathsParam = if (keepLeadingPaths) "--keep-leading-paths" else null

            return listOfNotNull(
                reportFile,
                formatParam,
                outputFileParam,
                notCompressedParam,
                keepLeadingPathsParam
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
