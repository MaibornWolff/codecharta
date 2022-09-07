package de.maibornwolff.codecharta.importer.codemaat

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "csv"

        override fun collectParserArgs(): List<String> {
            val defaultInputFileName = "edges.$EXTENSION"
            val inputFileName = KInquirer.promptInput(
                message = "What is the $EXTENSION file that has to be parsed?",
                hint = defaultInputFileName,
                default = defaultInputFileName
            )

            val defaultOutputFileName = getOutputFileName(inputFileName)
            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFileName,
                default = defaultOutputFileName
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
            )
        }
    }
}
