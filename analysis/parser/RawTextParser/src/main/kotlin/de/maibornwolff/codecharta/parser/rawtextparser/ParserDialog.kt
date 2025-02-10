package de.maibornwolff.codecharta.parser.rawtextparser

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
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
            outFileCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {},
            verboseCallback: suspend RunScope.() -> Unit = {},
            metricCallback: suspend RunScope.() -> Unit = {},
            tabCallback: suspend RunScope.() -> Unit = {},
            indentationCallback: suspend RunScope.() -> Unit = {},
            excludeCallback: suspend RunScope.() -> Unit = {},
            extensionCallback: suspend RunScope.() -> Unit = {},
            defaultCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val inputFileName = myPromptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = fileCallback
            )

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    myPromptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = compressCallback
                    )

            val verbose: Boolean = myPromptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = verboseCallback
            )

            val metrics: String = myPromptInput(
                message = "What are the metrics to import (comma separated)?",
                hint = "metric1,metric2,metric3 (leave empty for all metrics)",
                allowEmptyInput = true,
                onInputReady = metricCallback
            )

            val tabWidth: String = myPromptInputNumber(
                message = "How many spaces represent one indentation level when using spaces for indentation (estimated if empty)?",
                allowEmptyInput = true,
                onInputReady = tabCallback
            )

            val tabWidthValue = tabWidth.toIntOrNull() ?: 0

            val maxIndentationLevel: Int = myPromptInputNumber(
                message = "What is the maximum Indentation Level?",
                hint = "10",
                allowEmptyInput = false,
                onInputReady = indentationCallback
            ).toInt()

            val exclude: String =
                myPromptInput(
                    message = "Do you want to exclude file/folder according to regex pattern?",
                    hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                    allowEmptyInput = true,
                    onInputReady = excludeCallback
                )

            val fileExtensions: String =
                myPromptInput(
                    message = "Do you only want to parse files with specific file-extensions? ",
                    hint = "fileType1, fileType2... (leave empty to include all file-extensions)",
                    allowEmptyInput = true,
                    onInputReady = extensionCallback
                )

            val withoutDefaultExcludes: Boolean =
                myPromptConfirm(
                    message = "Do you want to include build, target, dist, resources" +
                        " and out folders as well as files/folders starting with '.'?",
                    onInputReady = defaultCallback
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
    }
}
