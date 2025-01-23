package de.maibornwolff.codecharta.parser.sourcecodeparser

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(
            fileCallback: suspend RunScope.() -> Unit = {},
            formatCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {},
            issueCallback: suspend RunScope.() -> Unit = {},
            defaultCallback: suspend RunScope.() -> Unit = {},
            excludeCallback: suspend RunScope.() -> Unit = {},
            verboseCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val inputFileName: String = myPromptDefaultFileFolderInput(
                allowEmptyInput = false,
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = fileCallback
            )

            val formatCCjson = "CodeCharta JSON"
            val formatCSV = "CSV"
            val outputFormatChoices = listOf(formatCCjson, formatCSV)

            val outputFormatAnswer = myPromptList(
                message = "Which output format should be generated?",
                choices = outputFormatChoices,
                onInputReady = formatCallback
            )

            val outputFormat = if (outputFormatAnswer == formatCCjson) OutputFormat.JSON else OutputFormat.CSV
            val defaultOutputFilename = if (outputFormat == OutputFormat.JSON) "output.cc.json" else "output.csv"

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFilename,
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    myPromptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = compressCallback
                    )

            val findIssues =
                myPromptConfirm(
                    message = "Should we search for sonar issues?",
                    onInputReady = issueCallback
                )

            val defaultExcludes =
                myPromptConfirm(
                    message = "Should we apply default excludes (build, target, dist and out folders, hidden files/folders)?",
                    onInputReady = defaultCallback
                )

            val exclude: String =
                myPromptInput(
                    message = "Do you want to exclude file/folder according to regex pattern?",
                    hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                    allowEmptyInput = true,
                    onInputReady = excludeCallback
                )

            val isVerbose: Boolean =
                myPromptConfirm(
                    message = "Display info messages from sonar plugins?",
                    onInputReady = verboseCallback
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
    }
}
