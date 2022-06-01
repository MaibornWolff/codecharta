package de.maibornwolff.codecharta.importer.csv

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val inputFileName = KInquirer.promptInput(
                    message = "What is the sourcemonitor CSV file that has to be parsed?",
                    hint = "sourcemonitor.csv"
            )

            val outputFileName: String = KInquirer.promptInput(
                    message = "What is the name of the output file?",
                    hint = "output.cc.json"
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

            val isCompressed: Boolean =
                    KInquirer.promptConfirm(message = "Do you want to compress the file?", default = false)

            return listOfNotNull(
                    inputFileName,
                    "--output-file=$outputFileName",
                    "--delimiter=$delimiter",
                    "--path-separator=$pathSeparator",
                    if (isCompressed) null else "--not-compressed",
            )
        }
    }
}
