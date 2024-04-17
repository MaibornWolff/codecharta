package de.maibornwolff.codecharta.tools.interactiveparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import java.io.File
import java.nio.file.Paths

interface ParserDialogInterface {
fun collectParserArgs(): List<String>

    fun getInputFileName(
    inputType: String,
    isFolder: Boolean,
    ): String {
        val fileOrFolder = if (isFolder) "folder of $inputType files" else "$inputType file"
        return KInquirer.promptInput(
                message = "What is the $fileOrFolder that should be parsed?",
                hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput$inputType",
                                    )
    }

    fun getInputFileName(
    customMessage: String,
    customHint: String,
    ): String {
        return KInquirer.promptInput(
                message = customMessage,
                hint =
                Paths.get("").toAbsolutePath()
                        .toString() + if (customHint.isBlank()) "" else File.separator + customHint,
                                    )
    }

    fun getOutputFileName(fullFileName: String): String {
        return fullFileName.substringAfterLast("/").substringAfterLast("\\").substringBefore(".")
    }
}
