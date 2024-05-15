package de.maibornwolff.codecharta.importer.util

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class ParserDialogHelper {
    companion object {
        fun getInputFiles(isSourceMonitor: Boolean): MutableList<String> {
            val inputFileNames = mutableListOf<String>()
            var firstFile: String
            do {
                firstFile = getInputFileName(isSourceMonitor)
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(firstFile)), canInputContainFolders = false))

            inputFileNames.add(firstFile)

            while (true) {
                var additionalFile = collectAdditionalFile()
                if (additionalFile.isBlank()) break
                while (!InputHelper.isInputValidAndNotNull(
                        arrayOf(File(additionalFile)),
                        canInputContainFolders = false
                    )
                ) {
                    additionalFile = collectAdditionalFile()
                }
                inputFileNames.add(additionalFile)
            }

            return inputFileNames
        }

        private fun getInputFileName(isSourceMonitor: Boolean): String {
            return KInquirer.promptInput(
                message = if (isSourceMonitor) "What is the SourceMonitor CSV file that has to be parsed?" else "Please specify the name of the first CSV file to be parsed.",
                hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.csv"
            )
        }

        private fun collectAdditionalFile(): String {
            return KInquirer.promptInput(
                message = "If you want to parse additional CSV files, specify the name of the next file. Otherwise, leave this field empty to skip."
            )
        }
    }
}
