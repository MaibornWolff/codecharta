package de.maibornwolff.codecharta.importer.csv

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val inputFileNames = mutableListOf(KInquirer.promptInput(
                    message = "Please specify the name of the first sourcemonitor CSV file to be parsed:",
                    hint = "input.csv"
            ))
            while (true) {
                val additionalFile = KInquirer.promptInput(
                        message = "If you want to parse additional sourcemonitor CSV files, specify the name of the next file. Otherwise, leave this field empty to skip.",
                )
                if (additionalFile.isNotBlank()) {
                    inputFileNames.add(additionalFile)
                } else {
                    break
                }
            }

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

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            return inputFileNames + listOfNotNull(
                    "--output-file=$outputFileName",
                    "--path-column-name=$pathColumnName",
                    "--delimiter=$delimiter",
                    "--path-separator=$pathSeparator",
                    if (isCompressed) null else "--not-compressed",
            )
        }
    }
}
