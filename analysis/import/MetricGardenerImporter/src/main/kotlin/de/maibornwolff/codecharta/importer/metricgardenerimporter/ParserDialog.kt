package de.maibornwolff.codecharta.importer.metricgardenerimporter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val isJsonFile: Boolean =
                KInquirer.promptConfirm(
                    message = "Do you already have a MetricGardener json-File?",
                    default = false
                )

            var inputFile = collectInputFileName(isJsonFile)
            while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFile)), canInputContainFolders = true)) {
                inputFile = collectInputFileName(isJsonFile)
            }

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file? If empty, the result will be returned in the terminal",
                hint = "path/to/output/filename.cc.json"
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            return listOfNotNull(
                inputFile,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                if (isJsonFile) "--is-json-file" else null
            )
        }

        private fun collectInputFileName(isJsonFile: Boolean): String {
            return KInquirer.promptInput(
                    message = if (isJsonFile) "Which MetricGardener json-File do you want to import?" else "What Project do you want to parse?",
                    hint = if (isJsonFile) { Paths.get("").toAbsolutePath().toString() + File.separator + "file.json" } else Paths.get("").toAbsolutePath().toString()
            )
        }
    }
}
