package de.maibornwolff.codecharta.analysers.parsers.rawtext

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptInputNumber

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

            val verbose: Boolean = session.promptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )

            val metrics: String = session.promptInput(
                message = "What are the metrics to import (comma separated)?",
                hint = "metric1,metric2,metric3 (leave empty for all metrics)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val tabWidth: String = session.promptInputNumber(
                message = "How many spaces represent one indentation level when using spaces for indentation (estimated if empty)?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val tabWidthValue = tabWidth.toIntOrNull() ?: 0

            val maxIndentationLevel: String = session.promptInputNumber(
                message = "What is the maximum Indentation Level?",
                hint = "10",
                allowEmptyInput = false,
                onInputReady = testCallback()
            )

            val exclude: String =
                session.promptInput(
                    message = "Do you want to exclude file/folder according to regex pattern?",
                    hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

            val fileExtensions: String =
                session.promptInput(
                    message = "Do you only want to parse files with specific file-extensions? ",
                    hint = "fileType1, fileType2... (leave empty to include all file-extensions)",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

            val withoutDefaultExcludes: Boolean =
                session.promptConfirm(
                    message = "Do you want to include build, target, dist, resources" +
                        " and out folders as well as files/folders starting with '.'?",
                    onInputReady = testCallback()
                )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=$verbose",
                "--metrics=$metrics",
                "--tab-width=$tabWidthValue",
                "--max-indentation-level=$maxIndentationLevel",
                "--exclude=$exclude",
                "--file-extensions=$fileExtensions",
                "--without-default-excludes=$withoutDefaultExcludes"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
