package de.maibornwolff.codecharta.parser.rawtextparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.math.BigDecimal

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var inputFileName: String
            do {
                inputFileName = getInputFileName("What is the file (.txt) or folder that has to be parsed?", "")
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = true))

            val outputFileName: String =
                KInquirer.promptInput(
                    message = "What is the name of the output file (leave empty to print to stdout)?"
                )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    KInquirer.promptConfirm(
                        message = "Do you want to compress the output file?",
                        default = true
                    )

            val verbose: Boolean =
                KInquirer.promptConfirm(message = "Do you want to suppress command line output?", default = false)

            val metrics: String =
                KInquirer.promptInput(
                    message = "What are the metrics to import (comma separated)?",
                    hint = "metric1, metric2, metric3 (leave empty for all metrics)"
                )

            val tabWidth: String =
                KInquirer.promptInput(
                    message = "How many spaces represent one indentation level when using spaces for indentation (estimated if empty)?",
                    default = ""
                )
            val tabWidthValue = tabWidth.toIntOrNull() ?: 0

            val maxIndentationLevel: BigDecimal =
                KInquirer.promptInputNumber(
                    message = "What is the maximum Indentation Level?",
                    default = "10",
                    hint = "10"
                )

            val exclude: String =
                KInquirer.promptInput(
                    message = "Do you want to exclude file/folder according to regex pattern?",
                    default = "",
                    hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)"
                )

            val fileExtensions: String =
                KInquirer.promptInput(
                    message = "Do you only want to parse files with specific file-extensions? ",
                    default = "",
                    hint = "fileType1, fileType2... (leave empty to include all file-extensions)"
                )

            val withoutDefaultExcludes: Boolean =
                KInquirer.promptConfirm(
                    message = "Do you want to include build, target, dist, resources" +
                        " and out folders as well as files/folders starting with '.'?",
                    default = false
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
