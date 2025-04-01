package de.maibornwolff.codecharta.parser.sourcecodeparser

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.ParserDialogInterface
import de.maibornwolff.codecharta.analysers.tools.inquirer.InputType
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptList

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )

            val formatCCjson = "CodeCharta JSON"
            val formatCSV = "CSV"
            val outputFormatChoices = listOf(formatCCjson, formatCSV)

            val outputFormatAnswer = session.myPromptList(
                message = "Which output format should be generated?",
                choices = outputFormatChoices,
                onInputReady = testCallback()
            )

            val outputFormat = if (outputFormatAnswer == formatCCjson) OutputFormat.JSON else OutputFormat.CSV
            val defaultOutputFilename = if (outputFormat == OutputFormat.JSON) "output.cc.json" else "output.csv"

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFilename,
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    session.myPromptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = testCallback()
                    )

            val findIssues =
                session.myPromptConfirm(
                    message = "Should we search for sonar issues?",
                    onInputReady = testCallback()
                )

            val defaultExcludes =
                session.myPromptConfirm(
                    message = "Should we apply default excludes (build, target, dist and out folders, hidden files/folders)?",
                    onInputReady = testCallback()
                )

            val exclude: String =
                session.myPromptInput(
                    message = "Do you want to exclude file/folder according to regex pattern?",
                    hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

            val isVerbose: Boolean =
                session.myPromptConfirm(
                    message = "Display info messages from sonar plugins?",
                    onInputReady = testCallback()
                )

            return listOfNotNull(
                inputFileName,
                "--format=$outputFormat",
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                if (findIssues) null else "--no-issues",
                if (defaultExcludes) "--default-excludes" else null,
                if (isVerbose) "--verbose" else null,
                if (exclude.isEmpty()) null else "--exclude=$exclude"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
