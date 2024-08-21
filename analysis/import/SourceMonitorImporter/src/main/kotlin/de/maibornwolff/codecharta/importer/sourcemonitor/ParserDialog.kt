package de.maibornwolff.codecharta.importer.sourcemonitor

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.CSVFileAggregation.Companion.getInputFiles

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            val inputFileNames = getInputFiles("What is the SourceMonitor CSV file that has to be parsed?")

            val outputFileName: String =
                KInquirer.promptInput(
                    message = "What is the name of the output file?",
                    hint = "output.cc.json"
                )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    KInquirer.promptConfirm(
                        message = "Do you want to compress the output file?",
                        default = true
                    )

            return inputFileNames +
                listOfNotNull(
                    "--output-file=$outputFileName",
                    if (isCompressed) null else "--not-compressed"
                )
        }
    }
}
