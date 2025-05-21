package de.maibornwolff.codecharta.analysers.parsers.unified

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
            val inputFileName = session.promptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    session.promptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = testCallback()
                    )

            val askExcludeInclude = session.promptList(
                message = "Do you want to exclude files/folders based on regex patterns or limit the analysis to specific file extensions?",
                choices = listOf(
                    "Only exclude",
                    "Only include",
                    "Both",
                    "None"
                ),
                onInputReady = testCallback()
            )

            val exclude: String = if (askExcludeInclude == "Only exclude" || askExcludeInclude == "Both") {
                session.promptInput(
                    message = "Which regex patterns do you want to use to exclude files/folders from the analysis",
                    hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )
            } else {
                ""
            }

            val fileExtensions: String = if (askExcludeInclude == "Only include" || askExcludeInclude == "Both") {
                session.promptInput(
                    message = "Which file extensions do you want to include in the analysis?",
                    hint = "fileType1, fileType2... (leave empty to include all file-extensions)",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )
            } else {
                ""
            }

            val withoutDefaultExcludes: Boolean = session.promptConfirm(
                message = "Do you want to include build, target, dist, resources" +
                    " and out folders as well as files/folders starting with '.'?",
                onInputReady = testCallback()
            )

            val verbose: Boolean = session.promptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=${!verbose}",
                "--exclude=$exclude",
                "--file-extensions=$fileExtensions",
                if (withoutDefaultExcludes) "--without-default-excludes" else null,
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
