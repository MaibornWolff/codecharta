package de.maibornwolff.codecharta.tools.inspector

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
            var inputFileName: String
            do {
                inputFileName =
                    KInquirer.promptInput(
                        message = "What is the cc.json file that you want to inspect?",
                        hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.cc.json"
                    )
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = false))

            return listOf(inputFileName, *collectPrintArguments())
        }

        private fun collectPrintArguments(): Array<String> {
            val levels: BigDecimal =
                KInquirer.promptInputNumber(
                    message = "How many levels do you want to print?",
                    default = "0",
                    hint = "0"
                )
            return arrayOf("--levels=$levels")
        }
    }
}
