package de.maibornwolff.codecharta.importer.csv

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            val inputFileNames = getInputFiles()

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = "output.cc.json"
            )

            val pathColumnName: String = KInquirer.promptInput(
                message = "What is the name of the path column name?",
                default = "path"
            )

            val delimiter = KInquirer.promptInput(
                message = "Which column delimiter is used in the CSV file?",
                hint = ",",
                default = ","
            )

            val pathSeparator = KInquirer.promptInput(
                message = "Which path separator is used in the path names?",
                hint = "/",
                default = "/"
            )

            val isCompressed = outputFileName.isEmpty() ||
                KInquirer.promptConfirm(
                    message = "Do you want to compress the output file?",
                    default = true
                )

            return inputFileNames + listOfNotNull(
                "--output-file=$outputFileName",
                "--path-column-name=$pathColumnName",
                "--delimiter=$delimiter",
                "--path-separator=$pathSeparator",
                if (isCompressed) null else "--not-compressed"
            )
        }

        private fun getInputFiles(): MutableList<String> {
            val inputFileNames = mutableListOf<String>()
            var firstFile: String
            do {
                firstFile = getInputFileName()
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(firstFile)), canInputContainFolders = false))

            inputFileNames.add(firstFile)

            while (true) {
                var additionalFile = collectAdditionalFile()
                if (additionalFile.isBlank()) break
                while (!InputHelper.isInputValidAndNotNull(
                        arrayOf(File(additionalFile)),
                        canInputContainFolders = false
                    )
                ) {
                    additionalFile = collectAdditionalFile()
                }
                inputFileNames.add(additionalFile)
            }

            return inputFileNames
        }

        private fun getInputFileName(): String {
            return KInquirer.promptInput(
                message = "Please specify the name of the first CSV file to be parsed.",
                hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.csv"
            )
        }

        private fun collectAdditionalFile(): String {
            return KInquirer.promptInput(
                message = "If you want to parse additional CSV files, specify the name of the next file." +
                    " Otherwise, leave this field empty to skip."
            )
        }
    }
}
