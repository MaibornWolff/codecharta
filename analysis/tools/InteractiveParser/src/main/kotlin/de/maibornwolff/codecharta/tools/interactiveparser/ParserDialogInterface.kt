package de.maibornwolff.codecharta.tools.interactiveparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import java.io.File
import java.nio.file.Paths

enum class InputType {
    FOLDER,
    FILE,
    FOLDER_AND_FILE
}

interface ParserDialogInterface {
    fun collectParserArgs(): List<String>

    fun getInputFileName(fileExtension: String, inputType: InputType): String {
        val fileOrFolder = when (inputType) {
            InputType.FOLDER -> {
                "folder of $fileExtension files"
            }

            InputType.FILE -> {
                "$fileExtension file"
            }

            else -> {
                "folder or $fileExtension file"
            }
        }

        return KInquirer.promptInput(
            message = "What is the $fileOrFolder that should be parsed?",
            hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput$fileExtension"
        )
    }

    fun getInputFileName(customMessage: String, customHint: String): String {
        return KInquirer.promptInput(
            message = customMessage,
            hint =
                Paths.get("").toAbsolutePath()
                    .toString() + if (customHint.isBlank()) "" else File.separator + customHint
        )
    }

    fun getOutputFileName(fullFileName: String): String {
        return fullFileName.substringAfterLast("/").substringAfterLast("\\").substringBefore(".")
    }
}
