package de.maibornwolff.codecharta.dialogProvider

import de.maibornwolff.codecharta.serialization.FileExtension
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InputValidatorTest {
    private fun provideValidationExpectations(): List<Arguments> {
        return listOf(
            Arguments.of("src/test/resources/valid.log", listOf("log"), true),
            Arguments.of("src/test/resources/invalid.txt", listOf("log"), false),
            Arguments.of("src/test/resources/valid.log", listOf<String>(), true),
            Arguments.of("src/test/resources/valid.log", listOf("txt", "log"), true),
            Arguments.of("src/test/resources", listOf<String>(), false),
            Arguments.of("src/test/resources/doesNotExist.log", listOf("log"), false)
        )
    }

    private fun provideFileOrFolderInput(): List<Arguments> {
        return listOf(
            Arguments.of(InputType.FILE, listOf<FileExtension>(), "src/test/resources/valid.log", true),
            Arguments.of(InputType.FILE, listOf(FileExtension.CCJSON), "src/test/resources/validExtension.cc.json", true),
            Arguments.of(InputType.FILE, listOf(FileExtension.CCJSON), "src/test/resources/invalid.txt", false),
            Arguments.of(InputType.FILE, listOf<FileExtension>(), "src/test/resources/doesNotExist.log", false),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf<FileExtension>(), "src/test/resources", true),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf<FileExtension>(), "src/test/resources/doesNotExistFolder", false),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), "src/test/resources/validExtension.cc.json", true),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), "src/test/resources/invalid.txt", false),
            Arguments.of(InputType.FOLDER, listOf<FileExtension>(), "src/test/resources/invalid.txt", false),
            Arguments.of(InputType.FOLDER, listOf<FileExtension>(), "src/test/resources", true)
        )
    }

    private fun provideMultipleFileOrFolderInput(): List<Arguments> {
        val validLog = "src/test/resources/valid.log"
        val validExtension = "src/test/resources/validExtension.cc.json"
        val invalidTxt = "src/test/resources/invalid.txt"
        val doesNotExist = "src/test/resources/doesNotExist.log"
        val resourceFolder = "src/test/resources"
        val notExistingFolder = "src/test/resources/doesNotExistFolder"

        return listOf(
            Arguments.of(InputType.FILE, listOf<FileExtension>(), validLog, true),
            Arguments.of(InputType.FILE, listOf<FileExtension>(), "$validLog, $validExtension", true),
            Arguments.of(InputType.FILE, listOf(FileExtension.CCJSON), "$validExtension, $validExtension", true),
            Arguments.of(InputType.FILE, listOf(FileExtension.CCJSON), invalidTxt, false),
            Arguments.of(InputType.FILE, listOf(FileExtension.CCJSON), "$validExtension, $invalidTxt", false),
            Arguments.of(InputType.FILE, listOf<FileExtension>(), doesNotExist, false),
            Arguments.of(InputType.FILE, listOf<FileExtension>(), "$validExtension, $doesNotExist", false),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf<FileExtension>(), resourceFolder, true),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf<FileExtension>(), "$resourceFolder, $resourceFolder", true),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf<FileExtension>(), "$resourceFolder, $validExtension, $doesNotExist", false),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf<FileExtension>(), notExistingFolder, false),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf<FileExtension>(), "$resourceFolder, $notExistingFolder", false),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), validExtension, true),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), "$resourceFolder, $validExtension", true),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), invalidTxt, false),
            Arguments.of(InputType.FOLDER_AND_FILE, listOf(FileExtension.CCJSON), "$notExistingFolder, $invalidTxt", false),
            Arguments.of(
                InputType.FOLDER_AND_FILE,
                listOf(FileExtension.CCJSON),
                "$validExtension, $notExistingFolder, $invalidTxt",
                false
            ),
            Arguments.of(InputType.FOLDER, listOf<FileExtension>(), invalidTxt, false),
            Arguments.of(InputType.FOLDER, listOf<FileExtension>(), "$resourceFolder, $invalidTxt", false),
            Arguments.of(InputType.FOLDER, listOf<FileExtension>(), resourceFolder, true),
            Arguments.of(InputType.FOLDER, listOf<FileExtension>(), "$resourceFolder, $resourceFolder", true)
        )
    }

    private fun provideNumbersForVerification(): List<Arguments> {
        return listOf(
            Arguments.of(0, 1, true),
            Arguments.of(1, 0, false),
            Arguments.of(-1, 0, true)
        )
    }

    @ParameterizedTest
    @DisplayName("isInputAnExistingFile > should return expectedOutcome")
    @MethodSource("provideValidationExpectations")
    fun `should return expected output`(filePath: String, validFileExtensions: List<String>, expectedValidation: Boolean) {
        assertThat(
            InputValidator.isInputAnExistingFile(
                *validFileExtensions.toTypedArray()
            )(filePath)
        ).isEqualTo(expectedValidation)
    }

    @ParameterizedTest
    @DisplayName("isFileOrFolderValid > should return expectedOutcome")
    @MethodSource("provideFileOrFolderInput")
    fun `should return expectedOutput for files and folders`(
        inputType: InputType,
        fileExtensionList: List<FileExtension>,
        path: String,
        expectedValidation: Boolean
    ) {
        assertThat(
            InputValidator.isFileOrFolderValid(inputType, fileExtensionList)(path)
        ).isEqualTo(expectedValidation)
    }

    @ParameterizedTest
    @DisplayName("isNumberGreaterThen > should work as expected")
    @MethodSource("provideNumbersForVerification")
    fun `should return expected greater then check`(baseNumber: Int, inputNumber: Int, expectedValidation: Boolean) {
        assertThat(
            InputValidator.isNumberGreaterThen(baseNumber)(inputNumber.toString())
        ).isEqualTo(expectedValidation)
    }

    @ParameterizedTest
    @DisplayName("fileOrFolderValid(multiple) > should return true if all inputs are valid")
    @MethodSource("provideMultipleFileOrFolderInput")
    fun `should return expectedOutput for multiple files and folders`(
        inputType: InputType,
        fileExtensionList: List<FileExtension>,
        path: String,
        expectedValidation: Boolean
    ) {
        assertThat(InputValidator.isFileOrFolderValid(inputType, fileExtensionList, multiple = true)(path)).isEqualTo(expectedValidation)
    }
}
