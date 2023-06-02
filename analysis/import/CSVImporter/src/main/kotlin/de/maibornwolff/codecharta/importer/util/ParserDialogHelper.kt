package de.maibornwolff.codecharta.importer.util

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import java.io.File
import java.nio.file.Paths

class ParserDialogHelper {

    companion object {
        fun getInputFiles(isSourceMonitor: Boolean): MutableList<String> {
            val inputFileNames = mutableListOf(KInquirer.promptInput(
                    message = if (isSourceMonitor) { "What is the SourceMonitor CSV file that has to be parsed?" } else { "Please specify the name of the first CSV file to be parsed." },
                    hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.csv"))

            while (true) {
                val additionalFile = KInquirer.promptInput(
                        message = "If you want to parse additional sourcemonitor CSV files, specify the name of the next file. Otherwise, leave this field empty to skip.",
                                                          )
                if (additionalFile.isNotBlank()) {
                    inputFileNames.add(additionalFile)
                } else {
                    break
                }
            }

            return inputFileNames
        }
    }
}
