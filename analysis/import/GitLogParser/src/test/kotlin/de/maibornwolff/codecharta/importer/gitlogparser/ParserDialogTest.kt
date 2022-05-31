package de.maibornwolff.codecharta.importer.gitlogparser

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
import picocli.CommandLine
import java.io.File

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
        fileNameList: String,
        isCompressed: Boolean,
        isSilent: Boolean,
        addAuthor: Boolean
    ) {
        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName andThen fileNameList
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs()

        val cmdLine = CommandLine(GitLogParser())
        val parseResult = cmdLine.parseArgs(*parserArguments.toTypedArray())
        Assertions.assertThat(parseResult.matchedOption("output-file").getValue<String>())
                .isEqualTo(outputFileName)
        Assertions.assertThat(parseResult.matchedOption("file-name-list").getValue<File>().name).isEqualTo(fileNameList)
        Assertions.assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(isCompressed)
        Assertions.assertThat(parseResult.matchedOption("silent").getValue<Boolean>()).isEqualTo(isSilent)
        Assertions.assertThat(parseResult.matchedOption("add-author").getValue<Boolean>()).isEqualTo(addAuthor)
        Assertions.assertThat(parseResult.matchedPositional(0).getValue<File>().name).isEqualTo(fileName)
    }

    companion object {
        @JvmStatic
        fun provideArguments(): List<Arguments> {
            return listOf(
                Arguments.of(
                    "git", "codecharta.cc.json", "file-name-list.txt", false, false, false
                ), Arguments.of(
                    "git.log", "codecharta.cc.json", "file-name-list.txt", false, false, false
                )
            )
        }
    }
}
