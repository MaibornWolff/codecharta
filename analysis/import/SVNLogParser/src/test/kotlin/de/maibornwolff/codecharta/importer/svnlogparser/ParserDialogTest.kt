package de.maibornwolff.codecharta.importer.svnlogparser

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
        fileName: String,
        outputFileName: String,
        isCompressed: Boolean,
        isSilent: Boolean,
        addAuthor: Boolean
    ) {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs()

        Assertions.assertThat(parserArguments).isEqualTo(
            listOf(
                "svn.log",
                "-o $outputFileName",
                "--not-compressed=$isCompressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        )
    }

    companion object {
        @JvmStatic
        fun provideArguments(): List<Arguments> {
            return listOf(
                Arguments.of(
                    "svn", "codecharta.cc.json", false, false, false
                ), Arguments.of(
                    "svn.log", "codecharta.cc.json", false, false, false
                )
            )
        }
    }
}
