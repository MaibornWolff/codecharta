package de.maibornwolff.codecharta.importer.codemaat

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {
    private const val EXTENSION =
                "csv"

        override fun collectParserArgs(): List<String> {
            var inputFileName:
                    String
            do {
                inputFileName = getInputFileName()
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = false))

            val defaultOutputFileName =
                    getOutputFileName(inputFileName)
            val outputFileName:
                    String =
                    KInquirer.promptInput(
                            message = "What is the name of the output file?",
                            hint = defaultOutputFileName,
                            default = defaultOutputFileName,
                                         )

            val isCompressed =
                    (outputFileName.isEmpty()) ||
                    KInquirer.promptConfirm(
                            message = "Do you want to compress the output file?",
                            default = true,
                                           )

            return listOfNotNull(
                    inputFileName,
                    "--output-file=$outputFileName",
                    if (isCompressed) null else "--not-compressed",
                                )
        }

        private fun getInputFileName(): String {
            val defaultInputFileName =
                    "edges.$EXTENSION"
            val defaultInputFilePath =
                    Paths.get("").toAbsolutePath().toString() + File.separator + defaultInputFileName
            return KInquirer.promptInput(
                    message = "What is the $EXTENSION file that has to be parsed?",
                    hint = defaultInputFilePath,
                    default = defaultInputFilePath,
                                        )
        }
    }
}
