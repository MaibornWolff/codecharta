package de.maibornwolff.codecharta.importer.coverage

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.importer.coverage.languages.getFileExtensionsForLanguage
import de.maibornwolff.codecharta.importer.coverage.languages.getLanguageChoices
import de.maibornwolff.codecharta.importer.coverage.languages.getLanguageForLanguageChoice
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
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
                fileExtensionList = getFileExtensionsForLanguage(language),
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

            val languageParam = "--language=$language"
            val reportFileParam = "--report-file=$reportFile"
            val outputFileParam = if (outputFileName.isNotEmpty()) "--output-file=$outputFileName" else null
            val notCompressedParam = if (isCompressed) null else "--not-compressed"

            return listOfNotNull(
                languageParam,
                reportFileParam,
                outputFileParam,
                notCompressedParam
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
