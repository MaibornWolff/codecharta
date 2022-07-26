package de.maibornwolff.codecharta.importer.sonar

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assertions
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
        assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        assertThat(parseResult.matchedOption("user").getValue<String>()).isEqualTo(user)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(
            parseResult.matchedOption("metrics").getValue<ArrayList<String>>()
                  ).isEqualTo(listOf("metric1, metric2"))
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
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
        assertThat(parseResult.matchedPositional(0).getValue<String>()).isEqualTo(hostUrl)
        assertThat(parseResult.matchedPositional(1).getValue<String>()).isEqualTo(projectKey)
        assertThat(parseResult.matchedOption("user").getValue<String>()).isEqualTo(user)
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        Assertions.assertNull(parseResult.matchedOption("metrics"))
        assertThat(parseResult.matchedOption("not-compressed").getValue<Boolean>()).isEqualTo(compress)
        assertThat(parseResult.matchedOption("merge-modules").getValue<Boolean>()).isEqualTo(mergeModules)
    }
}
