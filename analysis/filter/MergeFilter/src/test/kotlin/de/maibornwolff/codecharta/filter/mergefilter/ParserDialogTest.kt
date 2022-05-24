package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @ParameterizedTest
    @MethodSource("provideArguments")
    fun `should output correct arguments`(
        inputFolderName: String,
        outputFileName: String,
        compress: Boolean,
        addMissing: Boolean,
        recursive: Boolean,
        leaf: Boolean,
        ignoreCase: Boolean
    ) {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen addMissing andThen recursive andThen leaf andThen ignoreCase

        val parserArguments = ParserDialog.collectParserArgs()

        Assertions.assertThat(parserArguments).isEqualTo(
            listOf(
                inputFolderName,
                "-o $outputFileName",
                "--not-compressed=$compress",
                "--add-missing=$addMissing",
                "--recursive=$recursive",
                "--leaf=$leaf",
                "--ignore-case=$ignoreCase"
            )
        )
    }

    companion object {
        @JvmStatic
        fun provideArguments(): List<Arguments> {
            return listOf(
                Arguments.of(
                    "folder", "combinedFile", false, false, false, false, false
                ), Arguments.of(
                    "folder", "combinedFile", true, true, true, true, true
                )
            )
        }
    }
}
