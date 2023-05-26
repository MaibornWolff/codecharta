package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import java.math.BigDecimal
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val inputFolderName =
                    KInquirer.promptInput(
                            message = "What is the cc.json file that has to be modified?",
                            hint = Paths.get("").toAbsolutePath().toString())

            val outputFileName: String = KInquirer.promptInput(
                    message = "What is the name of the output file?"
            )

            val setRoot: String =
                    KInquirer.promptInput(message = "What path within project to be extracted? (Optional)", default = "")

            val printLevels: BigDecimal =
                    KInquirer.promptInputNumber(message = "How many print levels do you want to print? (Optional)", default = "0", hint = "0")

            val moveFrom: String = KInquirer.promptInput(
                    message = "What are the nodes to be moved? (Optional)"
            )
            var moveTo: String = ""
            if (moveFrom.isNotBlank()) {
                moveTo = KInquirer.promptInput(
                        message = "Where to move them?"
                )
            }
            val remove: String = KInquirer.promptInput(
                    message = "What are the nodes to be removed? (Optional)"
            )
            return listOfNotNull(
                    inputFolderName,
                    "--output-file=$outputFileName",
                    if (printLevels.toInt() != 0) "--print-levels=$printLevels" else null,
                    if (setRoot.isNotBlank()) "--set-root=$setRoot" else null,
                    if (moveFrom.isNotBlank()) "--move-from=$moveFrom" else null,
                    if (moveFrom.isNotBlank()) "--move-to=$moveTo" else null,
                    if (remove.isNotBlank()) "--remove=$remove" else null,
            )
        }
    }
}
