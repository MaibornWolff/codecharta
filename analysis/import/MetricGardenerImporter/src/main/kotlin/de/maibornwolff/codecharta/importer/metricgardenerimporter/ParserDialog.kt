package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val inputFile = KInquirer.promptInput(
                message = "What Project do you want to parse?",
                hint = "path/to/my/project"
                                                 )

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file? If empty, the result will be returned in the terminal",
                hint = "path/to/output/filename.cc.json"
                                                              )

            val isCompressed: Boolean =
                KInquirer.promptConfirm(message = "Do you want to compress the output file?", default = true)

            return listOfNotNull(
                inputFile,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed"
                                )
        }
    }
}
