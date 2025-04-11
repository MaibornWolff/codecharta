package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptList

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName: String = session.promptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )

            val formatCCjson = "CodeCharta JSON"
            val formatCSV = "CSV"
            val outputFormatChoices = listOf(formatCCjson, formatCSV)

            val outputFormatAnswer = session.promptList(
                message = "Which output format should be generated?",
                choices = outputFormatChoices,
                onInputReady = testCallback()
            )

            val outputFormat = if (outputFormatAnswer == formatCCjson) OutputFormat.JSON else OutputFormat.CSV
            val defaultOutputFilename = if (outputFormat == OutputFormat.JSON) "output.cc.json" else "output.csv"

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFilename,
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    session.promptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = testCallback()
                    )

            val findIssues =
                session.promptConfirm(
                    message = "Should we search for sonar issues?",
                    onInputReady = testCallback()
                )

            val defaultExcludes =
                session.promptConfirm(
                    message = "Should we apply default excludes (build, target, dist and out folders, hidden files/folders)?",
                    onInputReady = testCallback()
                )

            val exclude: String =
                session.promptInput(
                    message = "Do you want to exclude file/folder according to regex pattern?",
                    hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

            val isVerbose: Boolean =
                session.promptConfirm(
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
