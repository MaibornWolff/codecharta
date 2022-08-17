package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.File

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments`() {
        val inputFolderName = "folder"
        val outputFileName = "sampleOutputFile"
        val compress = false
        val addMissing = false
        val recursive = false
        val leaf = false
        val ignoreCase = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns inputFolderName andThen outputFileName
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen addMissing andThen recursive andThen leaf andThen ignoreCase

        val parserArguments = ParserDialog.collectParserArgs()

        val commandLine = CommandLine(MergeFilter())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        assertThat(parseResult.matchedPositional(0).getValue<Array<File>>().map { it.name }).isEqualTo(
            listOf(
                inputFolderName
            )
        )
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        assertThat(parseResult.matchedOption("add-missing").getValue<Boolean>()).isEqualTo(addMissing)
        assertThat(parseResult.matchedOption("recursive").getValue<Boolean>()).isEqualTo(recursive)
        assertThat(parseResult.matchedOption("leaf").getValue<Boolean>()).isEqualTo(leaf)
        assertThat(parseResult.matchedOption("ignore-case").getValue<Boolean>()).isEqualTo(ignoreCase)
    }
}
