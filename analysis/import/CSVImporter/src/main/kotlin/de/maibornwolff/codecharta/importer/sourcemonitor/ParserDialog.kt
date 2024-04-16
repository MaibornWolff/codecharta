package de.maibornwolff.codecharta.importer.sourcemonitor

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.importer.util.ParserDialogHelper
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val inputFileNames = ParserDialogHelper.getInputFiles(true)

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = "output.cc.json"
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            return inputFileNames + listOfNotNull(
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed"
            )
        }
    }
}
