package de.maibornwolff.codecharta.importer.csv

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.CSVFileAggregation.Companion.getInputFiles

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            val inputFileNames = getInputFiles("Please specify the name of the first CSV file to be parsed.")

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
    }
}
