package de.maibornwolff.codecharta.tools.inquirer.util

import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import java.io.File

class InputValidator {
    companion object {
        fun isInputAnExistingFile(vararg allowedFiletypes: String): (String) -> Boolean = { input ->
            val file = File(input)
            val isFileCorrectType = allowedFiletypes.isEmpty() || allowedFiletypes.any { input.endsWith(it) }
            file.exists() && file.isFile && isFileCorrectType
        }

        fun isFileOrFolderValid(inputType: InputType, fileExtensionList: List<FileExtension>): (String) -> Boolean = { input ->
            val objectToVerify = File(input)
            objectToVerify.exists() && when (inputType) {
                InputType.FOLDER -> {
                    objectToVerify.isDirectory
                }
                InputType.FILE -> {
                    verifyFile(objectToVerify, fileExtensionList)
                }
                else -> {
                    objectToVerify.isDirectory || verifyFile(objectToVerify, fileExtensionList)
                }
            }
        }

        fun isNumberGreaterThen(minValue: Int): (String) -> Boolean = { input ->
            input.toInt() > minValue
        }

        private fun verifyFile(objectToVerify: File, fileExtensionList: List<FileExtension>): Boolean {
            return objectToVerify.isFile &&
                (fileExtensionList.isEmpty() || fileExtensionList.any { objectToVerify.name.endsWith(it.extension) })
        }
    }
}
