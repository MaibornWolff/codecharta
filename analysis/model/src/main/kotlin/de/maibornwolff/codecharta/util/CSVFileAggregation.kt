package de.maibornwolff.codecharta.util

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import java.io.File
import java.nio.file.Paths

class CSVFileAggregation {
    companion object {
        fun getInputFiles(firstInputPrompt: String): MutableList<String> {
            val inputFileNames = mutableListOf<String>()
            var firstFile: String
            do {
                firstFile = getInputFileName(firstInputPrompt)
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

        private fun getInputFileName(prompt: String): String {
            return KInquirer.promptInput(
                message = prompt,
                hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.csv"
            )
        }

        private fun collectAdditionalFile(): String {
            return KInquirer.promptInput(
                message = "If you want to parse additional CSV files, specify the name of the next file." +
                    " Otherwise, leave this field empty to skip."
            )
        }
    }
}
