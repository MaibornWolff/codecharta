package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import java.io.File

class ParserDialog {
    companion object : ParserDialogInterface {
    override fun collectParserArgs(): List<String> {
            var inputFileName: String
            do {
                inputFileName = getInputFileName("cc.json", false)
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = false))

            Logger.info {
                "File path: $inputFileName"
            }

            val defaultOutputFileName = getOutputFileName(inputFileName)
            val outputFileName: String =
                    KInquirer.promptInput(
                            message = "What is the name of the output file?",
                            hint = defaultOutputFileName,
                            default = defaultOutputFileName,
                                         )

            val defaultPathSeparator = "/"
            val pathSeparator: String =
                    KInquirer.promptInput(
                            message = "What is the path separator?",
                            hint = defaultPathSeparator,
                            default = defaultPathSeparator,
                                         )

            return listOf(inputFileName, "--output-file=$outputFileName", "--path-separator=$pathSeparator")
        }
    }
}
