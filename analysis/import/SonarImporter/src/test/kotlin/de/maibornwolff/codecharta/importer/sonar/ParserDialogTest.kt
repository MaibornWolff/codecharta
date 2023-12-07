package de.maibornwolff.codecharta.importer.sonar

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ParserDialogTest {

    @AfterAll
    fun afterTest() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments`() {
        val hostUrl = "https://sonar.foo"
        val projectKey = "de.foo:bar"
        val user = "c123d456"
        val outputFileName = "codecharta.cc.json"
        val metrics = "metric1, metric2"
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen projectKey andThen user andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        val parserArguments = ParserDialog.collectParserArgs()

        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        assertEquals(parseResult.matchedPositional(0).getValue<String>(), hostUrl)
        assertEquals(parseResult.matchedPositional(1).getValue<String>(), projectKey)
        assertEquals(parseResult.matchedOption("user").getValue<String>(), user)
        assertEquals(parseResult.matchedOption("output-file").getValue<String>(), outputFileName)
        assertEquals(
            parseResult.matchedOption("metrics").getValue<ArrayList<String>>(),
            listOf("metric1", "metric2")
        )
        assertEquals(parseResult.matchedOption("not-compressed").getValue<Boolean>(), compress)
        assertEquals(parseResult.matchedOption("merge-modules").getValue<Boolean>(), mergeModules)
    }

    @Test
    fun `should omit the metrics flag if the metrics are empty`() {
        val hostUrl = "https://sonar.foo"
        val projectKey = "de.foo:bar"
        val user = "c123d456"
        val outputFileName = "codecharta.cc.json"
        val metrics = ""
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen projectKey andThen user andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        val parserArguments = ParserDialog.collectParserArgs()

        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        assertEquals(parseResult.matchedPositional(0).getValue<String>(), hostUrl)
        assertEquals(parseResult.matchedPositional(1).getValue<String>(), projectKey)
        assertEquals(parseResult.matchedOption("user").getValue<String>(), user)
        assertEquals(parseResult.matchedOption("output-file").getValue<String>(), outputFileName)
        assertNull(parseResult.matchedOption("metrics"))
        assertEquals(parseResult.matchedOption("not-compressed").getValue<Boolean>(), compress)
        assertEquals(parseResult.matchedOption("merge-modules").getValue<Boolean>(), mergeModules)
    }

    @Test
    fun `should omit the user flag if user is empty`() {
        val hostUrl = "https://sonar.foo"
        val projectKey = "de.foo:bar"
        val user = ""
        val outputFileName = "codecharta.cc.json"
        val metrics = "metric1, metric2"
        val compress = false
        val mergeModules = false

        mockkStatic("com.github.kinquirer.components.InputKt")
        every {
            KInquirer.promptInput(any(), any(), any())
        } returns hostUrl andThen projectKey andThen user andThen outputFileName andThen metrics
        mockkStatic("com.github.kinquirer.components.ConfirmKt")
        every {
            KInquirer.promptConfirm(any(), any())
        } returns compress andThen mergeModules

        val parserArguments = ParserDialog.collectParserArgs()

        val commandLine = CommandLine(SonarImporterMain())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
        assertEquals(parseResult.matchedPositional(0).getValue<String>(), hostUrl)
        assertEquals(parseResult.matchedPositional(1).getValue<String>(), projectKey)
        assertNull(parseResult.matchedOption("user"))
        assertEquals(parseResult.matchedOption("output-file").getValue<String>(), outputFileName)
        assertEquals(
            parseResult.matchedOption("metrics").getValue<ArrayList<String>>(),
            listOf("metric1", "metric2")
        )
        assertEquals(parseResult.matchedOption("not-compressed").getValue<Boolean>(), compress)
        assertEquals(parseResult.matchedOption("merge-modules").getValue<Boolean>(), mergeModules)
    }
}
