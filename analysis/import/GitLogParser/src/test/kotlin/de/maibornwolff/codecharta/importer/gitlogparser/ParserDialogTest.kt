package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments for file without extension`() {
        val fileName = "git"
        val outputFileName = "codecharta.cc.json"
        val fileNameList = "file-name-list.txt"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName andThen fileNameList
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs()

        Assertions.assertThat(parserArguments).isEqualTo(
            listOf(
                "git.log",
                "-o $outputFileName",
                "--file-name-list=$fileNameList",
                "--not-compressed=$isCompressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        )
    }

    @Test
    fun `should output correct arguments for file with correct extension`() {
        val fileName = "git.log"
        val outputFileName = "codecharta.cc.json"
        val fileNameList = "file-name-list.txt"
        val isCompressed = false
        val isSilent = false
        val addAuthor = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns fileName andThen outputFileName andThen fileNameList
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns isCompressed andThen isSilent andThen addAuthor

        val parserArguments = ParserDialog.collectParserArgs()

        Assertions.assertThat(parserArguments).isEqualTo(
            listOf(
                fileName,
                "-o $outputFileName",
                "--file-name-list=$fileNameList",
                "--not-compressed=$isCompressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        )
    }
}
