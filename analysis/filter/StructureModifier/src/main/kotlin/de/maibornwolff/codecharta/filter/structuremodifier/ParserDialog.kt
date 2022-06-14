package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import java.math.BigDecimal

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val inputFolderName =
                KInquirer.promptInput(message = "What is the cc.json file that has to be modified?")

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?"
            )

            val setRoot: String =
                KInquirer.promptInput(message = "What path within project to be extracted? (Optional)", default = "")

            val printLevels: BigDecimal =
                KInquirer.promptInputNumber(message = "How many print levels do you want to print? (Optional)", default = "0", hint = "0")

            val moveTo: String = KInquirer.promptInput(
                message = "What are the nodes to be moved? (Optional)"
            )
            val moveFrom: String = KInquirer.promptInput(
                message = "Where to move them? (Optional)"
            )
            val remove: String = KInquirer.promptInput(
                message = "What are the nodes to be removed? (Optional)"
            )
            return listOf(
                inputFolderName,
                "--output-file=$outputFileName",
                "--print-levels=$printLevels",
                "--set-root=$setRoot",
                "--move-to=$moveTo",
                "--move-from=$moveFrom",
                "--remove=$remove",
            )
        }
    }
}
