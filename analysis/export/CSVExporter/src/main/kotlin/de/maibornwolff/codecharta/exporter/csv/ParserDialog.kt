package de.maibornwolff.codecharta.exporter.csv

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.math.BigDecimal
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var inputFileName = collectInputFileName()
            while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = false)) {
                inputFileName = collectInputFileName()
            }

            val defaultOutputFileName = getOutputFileName(inputFileName)
            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFileName,
                default = defaultOutputFileName
            )

            val maxHierarchy: BigDecimal =
                KInquirer.promptInputNumber(message = "What is the maximum depth of hierarchy", hint = "10", default = "10")

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--depth-of-hierarchy=$maxHierarchy"
            )
        }

        private fun collectInputFileName(): String {
            return KInquirer.promptInput(
                    message = "What is the cc.json file that has to be parsed?",
                    hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.cc.json")
        }
    }
}
