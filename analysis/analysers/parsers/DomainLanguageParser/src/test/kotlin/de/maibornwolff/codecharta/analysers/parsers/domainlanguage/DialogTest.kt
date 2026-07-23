package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.terminal.inmemory.InMemoryTerminal
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.Dialog.Companion.collectAnalyserArgs
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.SortBy
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.StopWordLevel
import io.mockk.every
import io.mockk.mockkObject
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.Timeout
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.File
import java.nio.file.Path
import kotlin.io.path.writeText

@Timeout(120)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DialogTest {
    private val outputFileName = "test.cc.json"

    @Test
    fun `should output correct arguments when provided with valid input`(
        @TempDir tempDir: Path
    ) {
        val inputFileName = sourceFile(tempDir)
        mockkObject(Dialog.Companion)
        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            every { Dialog.testCallback() } returnsMany listOf(
                terminal.typing(inputFileName),
                terminal.typing(outputFileName),
                terminal.answeringNo(), // compress
                terminal.answeringNo(), // suppress command line output
                terminal.answeringNo(), // exclude .gitignore entries
                terminal.answeringYes(), // exclude test files
                terminal.typing("2"), // ngrams
                terminal.answeringYes(), // disable SSR
                terminal.typing("50"), // limit
                terminal.answeringYes(), // sort-by list: take the first entry
                terminal.answeringYes(), // stop-word-level list: take the first entry
                terminal.answeringYes(), // exclude technical stopwords
                terminal.answeringYes() // disable tf-idf
            )
            parserArguments = collectAnalyserArgs(this)
        }
        val parseResult = CommandLine(DomainLanguageParser()).parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.hasMatchedOption("not-compressed")).isTrue()
        assertThat(parseResult.matchedOption("verbose").getValue<Boolean>()).isTrue()
        assertThat(parseResult.hasMatchedOption("bypass-gitignore")).isTrue()
        assertThat(parseResult.hasMatchedOption("exclude-tests")).isTrue()
        assertThat(parseResult.matchedOption("ngrams").getValue<Int>()).isEqualTo(2)
        assertThat(parseResult.hasMatchedOption("no-ssr")).isTrue()
        assertThat(parseResult.matchedOption("limit").getValue<Int>()).isEqualTo(50)
        assertThat(parseResult.matchedOption("sort-by").getValue<SortBy>()).isEqualTo(SortBy.entries.first())
        assertThat(parseResult.matchedOption("stop-word-level").getValue<StopWordLevel>()).isEqualTo(StopWordLevel.entries.first())
        assertThat(parseResult.hasMatchedOption("exclude-technical-stopwords")).isTrue()
        assertThat(parseResult.hasMatchedOption("no-tfidf")).isTrue()
        assertThat(parseResult.matchedPositional(0).getValue<List<File>>().first().name)
            .isEqualTo(File(inputFileName).name)
    }

    @Test
    fun `should not ask about SSR when only unigrams are requested`(
        @TempDir tempDir: Path
    ) {
        val inputFileName = sourceFile(tempDir)
        mockkObject(Dialog.Companion)
        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            every { Dialog.testCallback() } returnsMany listOf(
                terminal.typing(inputFileName),
                terminal.typing(""), // no output file, so the compress question is skipped
                terminal.answeringNo(), // suppress command line output
                terminal.answeringNo(), // exclude .gitignore entries
                terminal.answeringNo(), // exclude test files
                terminal.typing("1"), // ngrams — leaves SSR unasked
                terminal.typing(""), // limit
                terminal.answeringYes(), // sort-by list
                terminal.answeringYes(), // stop-word-level list
                terminal.answeringNo(), // exclude technical stopwords
                terminal.answeringNo() // disable tf-idf
            )
            parserArguments = collectAnalyserArgs(this)
        }

        assertThat(parserArguments).noneMatch { it.startsWith("--no-ssr") }
        assertThat(parserArguments).noneMatch { it.startsWith("--limit") }
        assertThat(parserArguments).noneMatch { it.startsWith("--exclude-tests") }
        assertThat(parserArguments).contains("--ngrams=1")
    }

    @Test
    fun `should fall back to unigrams when the ngram size is not a positive number`(
        @TempDir tempDir: Path
    ) {
        val inputFileName = sourceFile(tempDir)
        mockkObject(Dialog.Companion)
        var parserArguments: List<String> = emptyList()

        testSession { terminal ->
            every { Dialog.testCallback() } returnsMany listOf(
                terminal.typing(inputFileName),
                terminal.typing(""),
                terminal.answeringNo(),
                terminal.answeringNo(),
                terminal.answeringNo(),
                terminal.typing("0"), // below the minimum of 1
                terminal.typing(""),
                terminal.answeringYes(),
                terminal.answeringYes(),
                terminal.answeringNo(),
                terminal.answeringNo()
            )
            parserArguments = collectAnalyserArgs(this)
        }

        assertThat(parserArguments).contains("--ngrams=1")
    }

    private fun sourceFile(tempDir: Path): String {
        val file = tempDir.resolve("Service.kt")
        file.writeText("class Service")
        return file.toString()
    }
}

private fun InMemoryTerminal.typing(text: String): suspend RunScope.() -> Unit = {
    if (text.isNotEmpty()) type(text)
    press(Keys.ENTER)
}

private fun InMemoryTerminal.answeringYes(): suspend RunScope.() -> Unit = {
    press(Keys.ENTER)
}

private fun InMemoryTerminal.answeringNo(): suspend RunScope.() -> Unit = {
    press(Keys.RIGHT)
    press(Keys.ENTER)
}
