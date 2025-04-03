package de.maibornwolff.codecharta.analysis.importer.coverage

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.ParserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.myPromptConfirm
import de.maibornwolff.codecharta.dialogProvider.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.myPromptInput
import de.maibornwolff.codecharta.dialogProvider.myPromptList
import java.util.Locale

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val languageChoice: String = session.myPromptList(
                message = "Specify the language of the coverage report",
                choices = getLanguageChoices(),
                onInputReady = testCallback()
            ).lowercase(Locale.getDefault())

            val language = getLanguageForLanguageChoice(languageChoice)

            val reportFile: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = language.fileExtensions,
                onInputReady = testCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                hint = "coverage.cc.json",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed = (outputFileName.isEmpty()) || session.myPromptConfirm(
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
