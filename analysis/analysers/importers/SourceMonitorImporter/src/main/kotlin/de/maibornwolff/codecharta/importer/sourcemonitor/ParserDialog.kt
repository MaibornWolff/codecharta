package de.maibornwolff.codecharta.analysis.importer.sourcemonitor

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.ParserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.myPromptConfirm
import de.maibornwolff.codecharta.dialogProvider.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.myPromptInput
import de.maibornwolff.codecharta.serialization.FileExtension

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CSV),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed = (outputFileName.isEmpty()) || session.myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
