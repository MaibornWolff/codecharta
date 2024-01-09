package de.maibornwolff.codecharta.importer.tokeiimporter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            var inputFileName: String
            do {
                inputFileName = getInputFileName("what is the Tokei JSON file that should be parsed?", "yourInput.json")
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = false))

            val outputFileName: String = KInquirer.promptInput(
                    message = "What is the name of the output file?",
                    hint = "output.cc.json"
            )

            val rootName = KInquirer.promptInput(
                    message = "Which root folder was specified when executing tokei?",
                hint = ".",
                default = "."
            )

            val pathSeparator = KInquirer.promptInput(
                message = "Which path separator is used in the path names?",
                hint = "/",
                default = "/"
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--root-name=$rootName",
                "--path-separator=$pathSeparator",
                if (isCompressed) null else "--not-compressed",
            )
        }
    }
}
