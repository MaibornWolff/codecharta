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
            val languageChoice: String = session.promptList(
                message = "Specify the language of the coverage report",
                choices = getLanguageChoices(),
                onInputReady = testCallback()
            ).lowercase(Locale.getDefault())

            val language = getLanguageForLanguageChoice(languageChoice)

            val reportFile: String = session.promptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = language.fileExtensions,
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

            val languageParam = "--language=${language.languageName}"
            val outputFileParam = if (outputFileName.isNotEmpty()) "--output-file=$outputFileName" else null
            val notCompressedParam = if (isCompressed) null else "--not-compressed"

            return listOfNotNull(
                reportFile,
                languageParam,
                outputFileParam,
                notCompressedParam
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
